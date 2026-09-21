import { startingPrice } from "@/lib/catalog/pricing";
import type { CatalogProduct } from "@/types/catalog";

export function ProductJsonLd({ product }: { product: CatalogProduct }) {
  const variant = startingPrice(product);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription ?? product.shortDescription,
    image: product.thumbnailUrl,
    sku: variant?.sku ?? product.sku,
    offers: variant
      ? {
          "@type": "Offer",
          priceCurrency: "INR",
          price: (variant.pricePaise / 100).toFixed(2),
          availability: "https://schema.org/InStock",
          url: `/products/${product.slug}`,
        }
      : undefined,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
