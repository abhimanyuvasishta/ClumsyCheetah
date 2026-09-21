"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CatalogProduct, CatalogVariant } from "@/types/catalog";
import { cartCount, cartSubtotal, readCart, writeCart, type CartLine } from "@/lib/commerce/cart";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  searchOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addItem: (product: CatalogProduct, variant: CatalogVariant, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setLines(readCart()));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const addItem = useCallback((product: CatalogProduct, variant: CatalogVariant, quantity = 1) => {
    const image = product.images.find((i) => i.isPrimary)?.url ?? product.thumbnailUrl;
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variant.id);
      const next = existing
        ? prev.map((l) => (l.variantId === variant.id ? { ...l, quantity: l.quantity + quantity } : l))
        : [
            ...prev,
            {
              productId: product.id,
              variantId: variant.id,
              slug: product.slug,
              name: product.name,
              variantName: variant.weightLabel ?? variant.name,
              image,
              unitPricePaise: variant.pricePaise,
              compareAtPaise: variant.compareAtPaise,
              quantity,
            },
          ];
      writeCart(next);
      return next;
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => {
      const next =
        quantity <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l));
      writeCart(next);
      return next;
    });
  }, []);

  const remove = useCallback((variantId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.variantId !== variantId);
      writeCart(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      drawerOpen,
      searchOpen,
      setDrawerOpen,
      setSearchOpen,
      addItem,
      setQuantity,
      remove,
    }),
    [addItem, drawerOpen, lines, remove, searchOpen, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
