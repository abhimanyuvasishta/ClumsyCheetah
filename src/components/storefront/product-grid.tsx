"use client";

import { ProductCard } from "@/components/storefront/product-card";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";
import type { CatalogProduct } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductGrid({ products, className }: { products: CatalogProduct[]; className?: string }) {
  const density = useStorefrontConfig().layout.productGrid;
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        density === "compact" ? "gap-x-2 gap-y-5 md:gap-x-3" : "gap-x-3 gap-y-8 md:gap-x-5",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
