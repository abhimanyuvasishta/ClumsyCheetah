import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/money";
import { OrderProductFeedback } from "@/components/storefront/order-product-feedback";

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
      "id, order_number, status, total_paise, subtotal_paise, placed_at, contact_name, shipping_address, order_items (id, product_id, product_name, variant_name, quantity, unit_price_paise, line_total_paise)",
    )
    .eq("id", id)
    .eq("user_id", user.userId)
    .maybeSingle();
  if (!order) notFound();

  const productIds = [...new Set((order.order_items ?? []).map((i) => i.product_id).filter(Boolean))] as string[];
  const { data: reviews } = productIds.length
    ? await supabase
        .from("reviews")
        .select("product_id, rating, body")
        .eq("order_id", order.id)
        .eq("user_id", user.userId)
        .in("product_id", productIds)
    : { data: [] };
  const byProduct = new Map((reviews ?? []).map((r) => [r.product_id, r]));
  const delivered = order.status === "DELIVERED";

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
          {(order.order_items ?? []).map((item, index) => {
            const firstOfProduct =
              item.product_id &&
              (order.order_items ?? []).findIndex((other) => other.product_id === item.product_id) === index;
            return (
            <li key={item.id} className="py-3">
              <div className="flex justify-between gap-3">
                <span>
                  {item.product_name}
                  {item.variant_name ? <span className="text-muted-foreground"> · {item.variant_name}</span> : null}
                  <span className="text-muted-foreground"> × {item.quantity}</span>
                </span>
                <span className="tabular-nums">{formatInr(item.line_total_paise)}</span>
              </div>
              {delivered && item.product_id && firstOfProduct ? (
                <OrderProductFeedback
                  orderId={order.id}
                  productId={item.product_id}
                  productName={item.product_name}
                  existing={byProduct.get(item.product_id) ?? null}
                />
              ) : null}
            </li>
            );
          })}
        </ul>
        {!delivered ? (
          <p className="mt-4 text-sm text-muted-foreground">You can rate these bakes once the order is marked delivered.</p>
        ) : null}
        <p className="mt-4 text-right font-medium">Total {formatInr(order.total_paise)}</p>
      </section>
    </div>
  );
}
