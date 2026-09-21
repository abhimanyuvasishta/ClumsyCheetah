"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/storefront/price";
import { ProductCard } from "@/components/storefront/product-card";
import { Rating } from "@/components/storefront/rating";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ProductBadge } from "@/components/storefront/product-badge";
import { useCart } from "@/components/storefront/cart-provider";
import { TrackRecentlyViewed } from "@/components/storefront/recently-viewed";
import { discountPercent } from "@/lib/money";
import type { CatalogProduct, CatalogVariant } from "@/types/catalog";

export function ProductDetail({
  product,
  related,
}: {
  product: CatalogProduct;
  related: CatalogProduct[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [qty, setQty] = useState(product.variants[0]?.minOrderQty ?? 1);
  const [activeImage, setActiveImage] = useState(product.images[0]?.url ?? product.thumbnailUrl);
  const [pincode, setPincode] = useState("");
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product.variants, variantId],
  );
  const flavours = [...new Set(product.variants.map((v) => v.flavour).filter(Boolean))] as string[];
  const weights = product.variants.filter((v) => (variant?.flavour ? v.flavour === variant.flavour : true));
  const discount = variant ? discountPercent(variant.pricePaise, variant.compareAtPaise) : null;
  const max = variant?.maxOrderQty ?? 12;

  function selectVariant(next: CatalogVariant) {
    setVariantId(next.id);
    setQty(next.minOrderQty);
  }

  function add() {
    if (!variant) return;
    addItem(product, variant, qty);
  }

  function buyNow() {
    add();
    router.push("/checkout");
  }

  return (
    <div className="pb-24 lg:pb-12">
      <TrackRecentlyViewed slug={product.slug} />
      <div className="store-wrap py-6 lg:py-10">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/shop", label: "Shop" },
            ...(product.category
              ? [{ href: `/collections/${product.category.slug}`, label: product.category.name }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-secondary">
              {activeImage ? <Image src={activeImage} alt={product.name} fill priority className="object-cover" /> : null}
            </div>
            {product.images.length > 1 ? (
              <div className="mt-3 flex gap-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className="relative size-16 overflow-hidden rounded-lg border"
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-1.5">
              {product.isBestseller ? <ProductBadge kind="BESTSELLER" /> : null}
              {product.isNewArrival ? <ProductBadge kind="NEW" /> : null}
              {product.isEggless ? <ProductBadge kind="EGGLESS" /> : null}
            </div>
            <h1 className="mt-3 font-heading text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
            <div className="mt-2">
              <Rating value={product.isBestseller ? 4.9 : 4.7} />
            </div>
            {variant ? (
              <div className="mt-4 flex items-baseline gap-3">
                <Price paise={variant.pricePaise} compareAtPaise={variant.compareAtPaise} className="text-2xl" />
                {discount ? <span className="text-sm text-caramel">{discount}% off</span> : null}
              </div>
            ) : null}
            <p className="mt-4 text-muted-foreground">{product.shortDescription}</p>

            {flavours.length > 1 ? (
              <fieldset className="mt-6">
                <legend className="text-sm font-medium">Flavour</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flavours.map((f) => {
                    const match = product.variants.find((v) => v.flavour === f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => match && selectVariant(match)}
                        className={`min-h-10 rounded-full border px-3 text-sm ${variant?.flavour === f ? "border-primary bg-primary text-primary-foreground" : ""}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {weights.length > 1 ? (
              <fieldset className="mt-5">
                <legend className="text-sm font-medium">Size</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weights.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectVariant(v)}
                      className={`min-h-10 rounded-full border px-3 text-sm ${variant?.id === v.id ? "border-primary bg-primary text-primary-foreground" : ""}`}
                    >
                      {v.weightLabel ?? v.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-5 hidden lg:block">
              <p className="text-sm font-medium">Quantity</p>
              <div className="mt-2 inline-flex min-h-11 items-center rounded-full border">
                <button type="button" className="px-4 py-2" onClick={() => setQty((q) => Math.max(variant?.minOrderQty ?? 1, q - 1))}>
                  −
                </button>
                <span className="min-w-8 text-center">{qty}</span>
                <button type="button" className="px-4 py-2" onClick={() => setQty((q) => Math.min(max, q + 1))}>
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 hidden gap-2 lg:flex">
              <Button size="lg" className="h-12 flex-1 rounded-full" type="button" onClick={add}>
                Add to cart
              </Button>
              <Button size="lg" variant="secondary" className="h-12 flex-1 rounded-full" type="button" onClick={buyNow}>
                Buy now
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full" type="button" aria-label="Wishlist">
                <Heart className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const ok = ["400050", "400052", "400058"].includes(pincode.trim());
                setPinMessage(
                  ok
                    ? "We can come to you. Pick a slot at checkout — usually a 3–5 hour lead."
                    : "Not that pin yet. Try 400050, 400052 or 400058.",
                );
              }}
              className="mt-8 border-t pt-6"
            >
              <label className="text-sm font-medium" htmlFor="pincode">
                Check delivery
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="h-11 flex-1 rounded-full border bg-background px-4 text-sm"
                />
                <Button type="submit" variant="outline" className="h-11 rounded-full">
                  Check
                </Button>
              </div>
              {pinMessage ? <p className="mt-2 text-sm text-muted-foreground">{pinMessage}</p> : null}
            </form>

            <details className="mt-8 border-t pt-4">
              <summary className="cursor-pointer font-medium">About this bake</summary>
              <p className="mt-2 text-sm text-muted-foreground">{product.longDescription}</p>
            </details>
            {product.ingredients ? (
              <details className="border-t py-4">
                <summary className="cursor-pointer font-medium">Ingredients</summary>
                <p className="mt-2 text-sm text-muted-foreground">{product.ingredients}</p>
              </details>
            ) : null}
            {product.allergenInfo ? (
              <details className="border-t py-4">
                <summary className="cursor-pointer font-medium">Allergens</summary>
                <p className="mt-2 text-sm text-muted-foreground">{product.allergenInfo}</p>
              </details>
            ) : null}
            {product.storageInstructions ? (
              <details className="border-t py-4">
                <summary className="cursor-pointer font-medium">Storage</summary>
                <p className="mt-2 text-sm text-muted-foreground">{product.storageInstructions}</p>
              </details>
            ) : null}
            <details className="border-t py-4">
              <summary className="cursor-pointer font-medium">Delivery</summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Same-day when the slot’s still open. {product.preparationTimeHours ? `Kitchen needs about ${product.preparationTimeHours} hours.` : null}
              </p>
            </details>
          </div>
        </div>

        {related.length ? (
          <section className="mt-16">
            <h2 className="font-heading text-3xl">You might also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-14 z-30 border-t bg-background/95 p-3 backdrop-blur md:bottom-0 lg:hidden">
        <div className="flex items-center gap-3">
          {variant ? <Price paise={variant.pricePaise} className="min-w-20" /> : null}
          <Button className="h-12 flex-1 rounded-full" type="button" onClick={add}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
