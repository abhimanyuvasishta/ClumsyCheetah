import Link from "next/link";
import { ProductGrid } from "@/components/storefront/product-grid";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCarousel({
  heading,
  subheading,
  href,
  products,
}: {
  heading: string;
  subheading?: string;
  href: string;
  products: CatalogProduct[];
}) {
  if (!products.length) return null;
  return (
    <section className="store-wrap py-16 md:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl">{heading}</h2>
          {subheading ? <p className="mt-2 text-muted-foreground">{subheading}</p> : null}
        </div>
        <Link href={href} className="hidden text-sm underline underline-offset-4 md:inline">
          See all
        </Link>
      </div>
      <div className="mt-8">
        <ProductGrid products={products.slice(0, 8)} />
      </div>
      <Link href={href} className="mt-6 inline-block text-sm underline underline-offset-4 md:hidden">
        See all
      </Link>
    </section>
  );
}
