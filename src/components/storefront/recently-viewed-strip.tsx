"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/storefront/product-grid";
import { readRecentSlugs } from "@/components/storefront/recently-viewed";
import type { CatalogProduct } from "@/types/catalog";

export function RecentlyViewedStrip({ products, currentSlug }: { products: CatalogProduct[]; currentSlug: string }) {
  const [shown, setShown] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      const slugs = readRecentSlugs().filter((s) => s !== currentSlug);
      setShown(products.filter((p) => slugs.includes(p.slug)).slice(0, 4));
    });
    return () => window.cancelAnimationFrame(id);
  }, [products, currentSlug]);

  if (!shown.length) return null;

  return (
    <section className="store-wrap pb-16">
      <h2 className="font-heading text-3xl">Recently viewed</h2>
      <div className="mt-6">
        <ProductGrid products={shown} />
      </div>
    </section>
  );
}
