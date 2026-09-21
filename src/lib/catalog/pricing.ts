import type { CatalogProduct, CatalogVariant } from "@/types/catalog";

export function startingPrice(product: CatalogProduct): CatalogVariant | undefined {
  return [...product.variants].sort((a, b) => a.pricePaise - b.pricePaise)[0];
}

export function lowestVariantPricePaise(product: CatalogProduct): number {
  const prices = product.variants.map((v) => v.pricePaise);
  return prices.length ? Math.min(...prices) : 0;
}
