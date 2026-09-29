export type KitchenLocation = {
  name: string;
  phone: string | null;
  email: string | null;
  line1: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

export type ShippingFields = {
  line1?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  notes?: string;
  gstin?: string;
};

export function parseShippingAddress(raw: unknown): ShippingFields {
  if (!raw || typeof raw !== "object") return {};
  const row = raw as Record<string, unknown>;
  const text = (key: string) => (typeof row[key] === "string" ? row[key] : undefined);
  return {
    line1: text("line1"),
    landmark: text("landmark"),
    city: text("city"),
    pincode: text("pincode"),
    notes: text("notes"),
    gstin: text("gstin"),
  };
}

export function shippingLines(addr: ShippingFields): string[] {
  return [addr.line1, addr.landmark, [addr.city, addr.pincode].filter(Boolean).join(" ")].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
}

export function locationLines(location: KitchenLocation | null): string[] {
  if (!location) return [];
  return [
    location.line1,
    [location.city, location.state, location.pincode].filter(Boolean).join(", "),
    location.phone,
    location.email,
  ].filter((part): part is string => Boolean(part && part.trim()));
}
