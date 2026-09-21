import { lineTotalPaise } from "@/lib/money";
import { homepageContent } from "@/data/homepage";

export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName: string;
  image: string | null;
  unitPricePaise: number;
  compareAtPaise: number | null;
  quantity: number;
};

const KEY = "cc-cart-v1";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotalPaise(line.unitPricePaise, line.quantity), 0);
}

export function amountToFreeDelivery(subtotal: number): number {
  return Math.max(0, homepageContent.freeDeliveryThresholdPaise - subtotal);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, line) => n + line.quantity, 0);
}
