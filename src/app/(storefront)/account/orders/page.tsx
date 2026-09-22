import type { Metadata } from "next";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/money";

export const metadata: Metadata = { title: "Your orders" };
export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createServerSupabaseClient();
  const { data: orders } = supabase
    ? await supabase
        .from("orders")
        .select("id, order_number, status, total_paise, placed_at")
        .eq("user_id", user.userId)
        .order("placed_at", { ascending: false })
        .limit(50)
    : { data: [] };

  if (!orders?.length) {
    return (
      <section className="rounded-[1.15rem] border bg-surface p-6">
        <h2 className="font-heading text-2xl">Orders</h2>
        <p className="mt-2 text-muted-foreground">When you place one, it lives here.</p>
        <Link href="/shop" className="mt-4 inline-block text-sm underline">
          Shop the case
        </Link>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.15rem] border bg-surface">
      <h2 className="border-b px-6 py-4 font-heading text-2xl">Orders</h2>
      <ul className="divide-y">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm hover:bg-muted/40">
              <span className="font-mono">{order.order_number}</span>
              <span>{order.status.replaceAll("_", " ")}</span>
              <span className="tabular-nums">{formatInr(order.total_paise)}</span>
              <span className="text-xs text-muted-foreground">{new Date(order.placed_at).toLocaleString("en-IN")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
