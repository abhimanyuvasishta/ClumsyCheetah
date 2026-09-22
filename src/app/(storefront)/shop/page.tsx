import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { EmptyState } from "@/components/storefront/empty-state";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { listCategories, listProducts } from "@/lib/catalog/queries";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import type { ShopFilters as Filters } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description: "All the good stuff from Clumsy Cheetah — cakes, brownies, cookies and gifting.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; eggless?: string; veg?: string; bestseller?: string; new?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const filters: Filters = {
    q: sp.q,
    category: sp.category,
    sort: (sp.sort as Filters["sort"]) ?? "popular",
    eggless: sp.eggless === "1",
    vegetarian: sp.veg === "1",
    bestseller: sp.bestseller === "1",
    newArrival: sp.new === "1",
  };
  const [products, categories, appearance] = await Promise.all([listProducts(filters), listCategories(), getStorefrontConfig()]);

  return (
    <div className="store-wrap py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Shop" }]} />
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl">
        {sp.q ? `Results for “${sp.q}”` : appearance.pages.shop.heading}
      </h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        {sp.q ? `Results for “${sp.q}”.` : appearance.pages.shop.body}
      </p>
      <Suspense>
        <ShopFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </Suspense>
      {products.length === 0 ? (
        <EmptyState
          title="Nothing baked up for that search."
          description="Try another word, or clear filters and wander the case."
          action={{ href: "/shop", label: "Reset" }}
        />
      ) : (
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
