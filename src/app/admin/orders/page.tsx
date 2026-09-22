import Link from "next/link";
import { listAdminOrders } from "@/lib/admin/orders";
import { formatInr } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await listAdminOrders(status);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Checkout payments are not live yet. Create a manual order to run the kitchen flow.</p>
        </div>
        <Link href="/admin/orders/new" className={cn(buttonVariants())}>
          New order
        </Link>
      </div>
      <form className="mt-4 flex gap-2">
        <select name="status" defaultValue={status ?? ""} className="h-8 rounded-lg border px-2 text-sm">
          <option value="">All</option>
          {[
            "PLACED",
            "CONFIRMED",
            "PREPARING",
            "READY",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Filter
        </button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b bg-[oklch(0.98_0.004_250)] text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-3 py-2">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">
                    {o.order_number}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">{o.channel}</p>
                </td>
                <td className="px-3 py-2">
                  {o.contact_name}
                  <p className="text-xs text-muted-foreground">{o.contact_phone}</p>
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span>
                </td>
                <td className="px-3 py-2 tabular-nums">{formatInr(o.total_paise)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(o.placed_at).toLocaleString("en-IN")}</td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No orders yet. Use New order.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
