"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/storefront/cart-provider";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";
import { startingPrice } from "@/lib/catalog/pricing";
import { cn } from "@/lib/utils";
import type { CatalogProduct, CatalogVariant } from "@/types/catalog";

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  label,
}: {
  product: CatalogProduct;
  variant?: CatalogVariant;
  quantity?: number;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const configuredLabel = useStorefrontConfig().pages.product.addToCart;
  const addLabel = label ?? configuredLabel;
  const [added, setAdded] = useState(false);
  const chosen = variant ?? startingPrice(product);
  if (!chosen) return null;
  const selected = chosen;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selected, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn("min-h-10 w-full rounded-full", className)}
    >
      {added ? "In the bag" : addLabel}
    </Button>
  );
}
