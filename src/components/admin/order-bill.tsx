import { exclusiveOfGst, formatInr, gstPortionPaise } from "@/lib/money";
import {
  locationLines,
  parseShippingAddress,
  shippingLines,
  type KitchenLocation,
} from "@/lib/admin/bill";
import type { AdminOrderDetail } from "@/lib/admin/orders";

export function OrderBill({
  order,
  kitchen,
}: {
  order: AdminOrderDetail;
  kitchen: KitchenLocation | null;
}) {
  const shipping = parseShippingAddress(order.shipping_address);
  const gstin = (order.gstin || shipping.gstin || "").trim();
  const taxable = exclusiveOfGst(order.total_paise);
  const gst = order.tax_paise > 0 ? order.tax_paise : gstPortionPaise(order.total_paise);
  const kitchenBits = locationLines(kitchen);
  const deliverTo = shippingLines(shipping);

  return (
    <article className="print-bill mx-auto max-w-[210mm] bg-white p-6 text-black">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" className="size-14 rounded-full object-contain" />
          <div>
            <p className="font-heading text-2xl leading-none">Clumsy Cheetah</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em]">Bakes</p>
            {kitchenBits.length ? (
              <p className="mt-2 max-w-xs text-xs text-neutral-600">{kitchenBits.join(" · ")}</p>
            ) : (
              <p className="mt-2 text-xs text-neutral-600">Mumbai</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Tax invoice</p>
          <p className="font-mono text-lg font-semibold">{order.order_number}</p>
          <p className="mt-1 text-xs text-neutral-600">
            {new Date(order.placed_at).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-neutral-600">{order.status.replaceAll("_", " ")}</p>
        </div>
      </header>

      <section className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Bill to</p>
          <p className="mt-1 font-medium">{order.contact_name}</p>
          <p>{order.contact_phone}</p>
          {order.contact_email ? <p>{order.contact_email}</p> : null}
          {gstin ? <p className="mt-1">GSTIN {gstin}</p> : null}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500">Deliver to</p>
          {deliverTo.length ? (
            deliverTo.map((line) => (
              <p key={line} className="mt-1 first:mt-1">
                {line}
              </p>
            ))
          ) : (
            <p className="mt-1 text-neutral-600">Same as bill to</p>
          )}
        </div>
      </section>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-y text-left text-[10px] uppercase tracking-widest text-neutral-500">
            <th className="py-2 pr-2">Item</th>
            <th className="py-2 pr-2">Qty</th>
            <th className="py-2 pr-2">Unit</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(order.order_items ?? []).map((item) => (
            <tr key={item.id} className="border-b border-neutral-200">
              <td className="py-2 pr-2">
                {item.product_name}
                {item.variant_name ? (
                  <span className="block text-xs text-neutral-500">{item.variant_name}</span>
                ) : null}
              </td>
              <td className="py-2 pr-2">{item.quantity}</td>
              <td className="py-2 pr-2 tabular-nums">{formatInr(item.unit_price_paise)}</td>
              <td className="py-2 text-right tabular-nums">{formatInr(item.line_total_paise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatInr(order.subtotal_paise)}</dd>
        </div>
        {order.discount_paise > 0 ? (
          <div className="flex justify-between">
            <dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt>
            <dd className="tabular-nums">−{formatInr(order.discount_paise)}</dd>
          </div>
        ) : null}
        {order.delivery_fee_paise > 0 ? (
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd className="tabular-nums">{formatInr(order.delivery_fee_paise)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between text-neutral-600">
          <dt>Taxable value</dt>
          <dd className="tabular-nums">{formatInr(taxable)}</dd>
        </div>
        <div className="flex justify-between text-neutral-600">
          <dt>GST 5%</dt>
          <dd className="tabular-nums">{formatInr(gst)}</dd>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatInr(order.total_paise)}</dd>
        </div>
      </dl>

      <p className="mt-8 text-[11px] text-neutral-500">
        Prices include GST at 5%. Thank you for ordering from Clumsy Cheetah.
      </p>
    </article>
  );
}
