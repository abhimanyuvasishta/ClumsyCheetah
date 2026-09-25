import Link from "next/link";
import { offerReport } from "@/lib/offers/admin";
import { offerLabel } from "@/lib/offers/types";
import { formatInr } from "@/lib/money";

export default async function OfferReportPage() {
  const { rows, missingTable } = await offerReport();
  const csv = [
    ["Offer", "Status", "Code", "Type", "Redemptions", "Discount", "Order totals"].join(","),
    ...rows.map((row) =>
      [
        JSON.stringify(row.offer.name),
        row.lifecycle,
        row.offer.coupon_code ?? "",
        offerLabel(row.offer),
        row.redemptions,
        (row.discountPaise / 100).toFixed(2),
        (row.orderTotalPaise / 100).toFixed(2),
      ].join(","),
    ),
  ].join("\n");

  return (
    <div>
      <h1 className="text-xl font-semibold">Offer report</h1>
      <p className="mt-1 text-sm text-muted-foreground">Redemptions and discount given. Totals are from the linked orders.</p>
      {missingTable ? (
        <p className="mt-4 text-sm">Run the offers SQL migration first.</p>
      ) : (
        <>
          <a
            className="mt-4 inline-block text-sm underline"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="offers-report.csv"
          >
            Download CSV
          </a>
          <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-[oklch(0.98_0.004_250)] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Redemptions</th>
                  <th className="px-3 py-2">Discount given</th>
                  <th className="px-3 py-2">Linked order totals</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.offer.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <p className="font-medium">{row.offer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {offerLabel(row.offer)} {row.offer.coupon_code ? `· ${row.offer.coupon_code}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-2">{row.lifecycle}</td>
                    <td className="px-3 py-2 tabular-nums">{row.redemptions}</td>
                    <td className="px-3 py-2 tabular-nums">{formatInr(row.discountPaise)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatInr(row.orderTotalPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Link href="/admin/offers" className="mt-6 inline-block text-sm underline">
        Back to offers
      </Link>
    </div>
  );
}
