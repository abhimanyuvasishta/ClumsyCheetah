import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/money";

export const metadata: Metadata = { title: "Order" };
export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) notFound();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_paise, subtotal_paise, placed_at, contact_name, shipping_address, order_items (id, product_name, variant_name, quantity, unit_price_paise, line_total_paise)",
    )
    .eq("id", id)
    .eq("user_id", user.userId)
    .maybeSingle();
  if (!order) notFound();

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="text-sm underline">
        ← All orders
      </Link>
      <section className="rounded-[1.15rem] border bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-xl">{order.order_number}</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs">{order.status.replaceAll("_", " ")}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{new Date(order.placed_at).toLocaleString("en-IN")}</p>
        <ul className="mt-6 divide-y text-sm">
          {(order.order_items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-3">
              <span>
                {item.product_name}
                {item.variant_name ? <span className="text-muted-foreground"> · {item.variant_name}</span> : null}
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="tabular-nums">{formatInr(item.line_total_paise)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right font-medium">Total {formatInr(order.total_paise)}</p>
      </section>
    </div>
  );
}
