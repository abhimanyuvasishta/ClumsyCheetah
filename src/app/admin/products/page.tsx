import Link from "next/link";
import { listAdminProducts } from "@/lib/admin/catalog";
import { formatInr } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearAllProducts } from "@/app/admin/products/actions";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const products = await listAdminProducts();
  const filtered = products.filter((p) => {
    const hay = `${p.name} ${p.sku ?? ""} ${p.slug}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (status && p.status !== status) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">This table is the source of truth. Shop only shows ACTIVE.</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants())}>
          New product
        </Link>
      </div>
      <form action={clearAllProducts} className="mt-3 flex flex-wrap items-end gap-2 text-sm">
        <label className="text-xs text-muted-foreground">
          Remove every product
          <input
            name="confirm"
            placeholder='Type DELETE'
            className="mt-1 block h-8 rounded-lg border px-2 font-mono text-xs"
            autoComplete="off"
          />
        </label>
        <button type="submit" className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}>
          Clear catalog
        </button>
      </form>
      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or SKU" className="h-8 rounded-lg border px-2 text-sm" />
        <select name="status" defaultValue={status ?? ""} className="h-8 rounded-lg border px-2 text-sm">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Filter
        </button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-[oklch(0.98_0.004_250)] text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">From</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const prices = (p.product_variants ?? []).map((v) => v.price_paise);
              const low = prices.length ? Math.min(...prices) : 0;
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.sku ?? "—"}</td>
                  <td className="px-3 py-2">{p.categories?.name ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{low ? formatInr(low) : "—"}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.status}</span>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No products. Run seed SQL or click New product.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
