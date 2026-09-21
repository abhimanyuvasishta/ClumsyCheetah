export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(paise) / 100);
}

export function discountPercent(pricePaise: number, compareAtPaise: number | null): number | null {
  if (!compareAtPaise || compareAtPaise <= pricePaise) {
    return null;
  }
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}

export function lineTotalPaise(unitPaise: number, quantity: number): number {
  if (quantity < 0 || !Number.isInteger(quantity)) {
    throw new Error("Quantity must be a non-negative integer");
  }
  return unitPaise * quantity;
}
