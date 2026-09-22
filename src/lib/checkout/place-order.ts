"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/staff";
import { lineTotalPaise } from "@/lib/money";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type CheckoutLineInput = { variantId: string; quantity: number };
export type CheckoutPayload = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  landmark: string;
  city: string;
  pincode: string;
  notes: string;
  method: "COD" | "UPI";
  lines: CheckoutLineInput[];
};

export type PlaceOrderResult = { error?: string; orderNumber?: string; orderId?: string; totalPaise?: number };

function nextOrderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CC-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function placeCheckoutOrder(payload: CheckoutPayload): Promise<PlaceOrderResult> {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const email = payload.email.trim();
  const line1 = payload.line1.trim();
  const city = payload.city.trim();
  const pincode = payload.pincode.trim();
  if (!name || !phone || !email || !line1 || !city || !pincode) {
    return { error: "Fill name, email, phone, address, city and PIN" };
  }
  if (payload.method !== "COD" && payload.method !== "UPI") {
    return { error: "Choose UPI QR or cash on delivery" };
  }
  const lines = payload.lines.filter((l) => l.variantId && Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= 20);
  if (!lines.length || lines.length > 30) {
    return { error: "Your bag is empty or too large" };
  }

  const db = createServiceRoleClient();
  if (!db) {
    return { error: "Checkout is not configured (missing service role key)" };
  }

  const ids = [...new Set(lines.map((l) => l.variantId))];
  const { data: variants, error: vErr } = await db
    .from("product_variants")
    .select("id, sku, name, price_paise, status, product_id, products:product_id (id, name, status, deleted_at)")
    .in("id", ids)
    .is("deleted_at", null);
  if (vErr || !variants?.length) {
    return { error: vErr?.message ?? "Those items are no longer available" };
  }

  const priced: {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unit: number;
    line: number;
  }[] = [];

  for (const line of lines) {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return { error: "An item in your bag is no longer for sale. Remove it and try again." };
    }
    const productRaw = variant.products as
      | { id: string; name: string; status: string; deleted_at: string | null }
      | { id: string; name: string; status: string; deleted_at: string | null }[]
      | null;
    const product = Array.isArray(productRaw) ? productRaw[0] : productRaw;
    if (variant.status !== "ACTIVE" || !product || product.status !== "ACTIVE" || product.deleted_at) {
      return { error: "An item in your bag is no longer for sale. Remove it and try again." };
    }
    const unit = variant.price_paise as number;
    priced.push({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      sku: variant.sku,
      quantity: line.quantity,
      unit,
      line: lineTotalPaise(unit, line.quantity),
    });
  }

  const subtotal = priced.reduce((sum, l) => sum + l.line, 0);
  const user = await getAuthUser();
  const { data: location } = await db.from("locations").select("id").eq("is_active", true).limit(1).maybeSingle();
  const orderNumber = nextOrderNumber();

  const { data: order, error } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user?.userId ?? null,
      location_id: location?.id ?? null,
      status: "PLACED",
      contact_name: name,
      contact_phone: phone,
      contact_email: email,
      shipping_address: {
        line1,
        landmark: payload.landmark.trim() || null,
        city,
        pincode,
        notes: payload.notes.trim() || null,
      },
      fulfillment_method: "DELIVERY",
      customer_notes: payload.notes.trim() || null,
      subtotal_paise: subtotal,
      total_paise: subtotal,
      channel: "WEB",
    })
    .select("id")
    .single();
  if (error || !order) {
    return { error: error?.message ?? "Could not place the order" };
  }

  const { error: itemsError } = await db.from("order_items").insert(
    priced.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      variant_id: l.variantId,
      product_name: l.productName,
      variant_name: l.variantName,
      sku: l.sku,
      quantity: l.quantity,
      unit_price_paise: l.unit,
      line_total_paise: l.line,
    })),
  );
  if (itemsError) {
    return { error: itemsError.message };
  }

  await db.from("order_status_history").insert({
    order_id: order.id,
    from_status: null,
    to_status: "PLACED",
    note: payload.method === "UPI" ? "Placed — UPI QR, confirm when paid" : "Placed — cash on delivery",
    changed_by: user?.userId ?? null,
  });

  await db.from("payments").insert({
    order_id: order.id,
    provider: payload.method === "COD" ? "COD" : "MANUAL",
    status: "PENDING",
    amount_paise: subtotal,
    provider_reference: payload.method === "UPI" ? "UPI_QR" : "COD",
  });

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return { orderNumber, orderId: order.id, totalPaise: subtotal };
}
