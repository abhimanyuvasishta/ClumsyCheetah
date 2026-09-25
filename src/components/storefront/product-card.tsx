"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/storefront/price";
import { ProductBadge } from "@/components/storefront/product-badge";
import { Rating } from "@/components/storefront/rating";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { useProductOffers } from "@/components/storefront/shop-commerce";
import { startingPrice } from "@/lib/catalog/pricing";
import { offerLabel } from "@/lib/offers/types";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? startingPrice(product),
    [product, variantId],
  );
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const offers = useProductOffers({
    id: product.id,
    categoryId: product.category?.id ?? null,
    isEggless: product.isEggless,
    isVegetarian: product.isVegetarian,
    isBestseller: product.isBestseller,
    isNewArrival: product.isNewArrival,
  });

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[1.1rem] bg-secondary">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5]">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Image coming</div>
          )}
        </Link>
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {product.isBestseller ? <ProductBadge kind="BESTSELLER" /> : null}
          {product.isNewArrival ? <ProductBadge kind="NEW" /> : null}
          {product.isEggless ? <ProductBadge kind="EGGLESS" /> : null}
          {offers.slice(0, 1).map((offer) => (
            <span
              key={offer.id}
              className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-espresso"
            >
              {offerLabel(offer)}
            </span>
          ))}
        </div>
        <WishlistButton productId={product.id} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <Link href={`/products/${product.slug}`} className="font-heading text-[1.05rem] leading-snug tracking-tight">
          {product.name}
        </Link>
        {product.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        ) : null}
        <div className="mt-2">
          <Rating value={product.isBestseller ? 4.9 : 4.7} />
        </div>
        {variant ? (
          <div className="mt-2">
            <Price paise={variant.pricePaise} compareAtPaise={variant.compareAtPaise} className="text-[0.95rem]" />
          </div>
        ) : null}
        {product.variants.length > 1 ? (
          <label className="mt-2 text-xs text-muted-foreground">
            Choose size
            <select
              className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"
              value={variant?.id}
              onChange={(e) => setVariantId(e.target.value)}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.weightLabel ?? v.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="mt-auto pt-3 opacity-100 md:opacity-90 md:transition md:group-hover:opacity-100">
          {variant ? <AddToCartButton product={product} variant={variant} /> : null}
        </div>
      </div>
    </article>
  );
}
