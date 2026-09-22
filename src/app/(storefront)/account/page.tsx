import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/storefront/sign-out-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

const steps = ["Placed", "Confirmed", "Baking", "Ready", "Out for delivery", "Delivered"] as const;

export function OrderTimeline({ current = 2 }: { current?: number }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span className={cn("size-2.5 rounded-full", i <= current ? "bg-caramel" : "bg-border")} />
          <span className={i <= current ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function AccountPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const supabase = await createServerSupabaseClient();
  const { data: profile } = supabase
    ? await supabase.from("profiles").select("full_name, phone, status").eq("id", user.userId).maybeSingle()
    : { data: null };
  const { data: orders } = supabase
    ? await supabase
        .from("orders")
        .select("id, order_number, status, total_paise, placed_at")
        .eq("user_id", user.userId)
        .order("placed_at", { ascending: false })
        .limit(8)
    : { data: [] };

  const firstName = profile?.full_name?.split(" ")[0] || "you";

  return (
    <div className="store-wrap py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 font-heading text-4xl">Hello, {firstName}.</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-8 rounded-[1.15rem] border bg-surface p-6">
        <p className="text-sm text-muted-foreground">Profile</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd>{profile?.full_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd>{user.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd>{profile?.phone || "—"}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/account", "Orders"],
          ["/account", "Addresses"],
          ["/wishlist", "Wishlist"],
        ].map(([href, label]) => (
          <Link key={label} href={href} className="rounded-[1.05rem] border bg-surface px-4 py-5 font-heading text-xl">
            {label}
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-[1.15rem] border bg-surface p-6">
        <p className="text-sm text-muted-foreground">Orders</p>
        {orders?.length ? (
          <ul className="mt-4 divide-y">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-mono">{order.order_number}</span>
                <span>{order.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-heading text-2xl">When you place one, it lives here.</p>
              <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs">Awaiting first bake</span>
            </div>
            <OrderTimeline current={-1} />
          </div>
        )}
      </section>
    </div>
  );
}
