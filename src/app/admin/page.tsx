import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin dashboard" };

const cards = [
  { label: "Today’s revenue", value: "—" },
  { label: "Today’s orders", value: "—" },
  { label: "Pending", value: "—" },
  { label: "Preparing", value: "—" },
  { label: "Completed", value: "—" },
  { label: "Cancelled", value: "—" },
  { label: "AOV", value: "—" },
  { label: "Low stock", value: "—" },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live metrics connect in Phase 10. Cards are wired for date filters; values stay empty until orders exist.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-medium">Recent orders</h2>
          <p className="mt-6 text-sm text-muted-foreground">Realtime order list ships in Phase 7.</p>
        </section>
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-sm font-medium">Top products</h2>
          <p className="mt-6 text-sm text-muted-foreground">Ranked once order_items exist.</p>
        </section>
      </div>
    </div>
  );
}
