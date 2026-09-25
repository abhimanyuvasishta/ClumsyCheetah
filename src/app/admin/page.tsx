import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/money";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();
  let products = 0;
  let active = 0;
  let orders = 0;
  let placed = 0;
  let customers = 0;
  let todayPaise = 0;

  if (supabase) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const [{ count: p }, { count: a }, { count: o }, { count: pl }, { count: c }, today] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "ACTIVE").is("deleted_at", null),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "PLACED"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_paise").gte("placed_at", start.toISOString()),
    ]);
    products = p ?? 0;
    active = a ?? 0;
    orders = o ?? 0;
    placed = pl ?? 0;
    customers = c ?? 0;
    todayPaise = (today.data ?? []).reduce((sum, row) => sum + (row.total_paise ?? 0), 0);
  }

  const cards = [
    { label: "Today’s revenue", value: todayPaise ? formatInr(todayPaise) : "—" },
    { label: "Orders (all)", value: String(orders) },
    { label: "Placed / kitchen", value: String(placed) },
    { label: "Products", value: String(products) },
    { label: "Active on shop", value: String(active) },
    { label: "Customers", value: String(customers) },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Counts from Postgres. Payments still off.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/products" className="underline">
          Catalog
        </Link>
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
        <Link href="/admin/customers" className="underline">
          Customers
        </Link>
        <Link href="/admin/appearance" className="underline">
          Website
        </Link>
        <Link href="/admin/offers" className="underline">
          Offers
        </Link>
      </div>
    </div>
  );
}
