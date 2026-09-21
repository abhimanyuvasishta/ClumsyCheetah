import { ProductCard } from "@/components/storefront/product-card";
import type { CatalogProduct } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductGrid({ products, className }: { products: CatalogProduct[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
