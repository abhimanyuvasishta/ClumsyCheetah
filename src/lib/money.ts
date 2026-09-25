export const GST_RATE = 0.05;

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

/** Rupees (shop display) to integer paise. Never store rupees. */
export function rupeesToPaise(rupees: string | number): number {
  const n = typeof rupees === "number" ? rupees : Number(String(rupees).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Price must be a number of rupees, 0 or more");
  }
  return Math.round(n * 100);
}

export function paiseToRupeesInput(paise: number): string {
  return (Math.round(paise) / 100).toFixed(2);
}

/** Listed shop prices are GST-inclusive at 5%. */
export function exclusiveOfGst(inclusivePaise: number): number {
  return Math.round(inclusivePaise / (1 + GST_RATE));
}

export function gstPortionPaise(inclusivePaise: number): number {
  return Math.max(0, inclusivePaise - exclusiveOfGst(inclusivePaise));
}
