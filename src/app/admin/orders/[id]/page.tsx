import Link from "next/link";
import { notFound } from "next/navigation";
import { saveStaffNotes, updateOrderStatus } from "@/app/admin/orders/actions";
import { allowedNextStatuses } from "@/lib/admin/order-status";
import { getAdminOrder } from "@/lib/admin/orders";
import { formatInr } from "@/lib/money";
import { Button } from "@/components/ui/button";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const next = allowedNextStatuses(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
          ← Orders
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-mono text-xl font-semibold">{order.order_number}</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-xs">{order.status}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.contact_name} · {order.contact_phone}
          {order.contact_email ? ` · ${order.contact_email}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <form key={status} action={updateOrderStatus.bind(null, order.id, status)}>
            <Button type="submit" variant={status === "CANCELLED" ? "destructive" : "default"} size="sm">
              Mark {status.replaceAll("_", " ")}
            </Button>
          </form>
        ))}
      </div>
      <section className="rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Line</th>
            </tr>
          </thead>
          <tbody>
            {(order.order_items ?? []).map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  {item.product_name}
                  <p className="text-xs text-muted-foreground">
                    {item.variant_name} {item.sku ? `· ${item.sku}` : ""}
                  </p>
                </td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2 tabular-nums">{formatInr(item.unit_price_paise)}</td>
                <td className="px-3 py-2 tabular-nums">{formatInr(item.line_total_paise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-8 px-3 py-3 text-sm">
          <span className="text-muted-foreground">Subtotal {formatInr(order.subtotal_paise)}</span>
          <span className="font-medium">Total {formatInr(order.total_paise)}</span>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-medium">Timeline</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {(order.order_status_history ?? []).map((h) => (
              <li key={h.id} className="border-l-2 pl-3">
                <span className="font-medium">{h.to_status}</span>
                {h.from_status ? <span className="text-muted-foreground"> from {h.from_status}</span> : null}
                <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN")}</p>
                {h.note ? <p className="text-xs">{h.note}</p> : null}
              </li>
            ))}
          </ol>
        </div>
        <form action={saveStaffNotes.bind(null, order.id)} className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-medium">Staff notes</h2>
          <textarea
            name="staff_notes"
            defaultValue={order.staff_notes ?? ""}
            rows={5}
            className="mt-2 w-full rounded-lg border px-2 py-2 text-sm"
          />
          <Button type="submit" size="sm" className="mt-2">
            Save notes
          </Button>
        </form>
      </section>
    </div>
  );
}
