"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/staff";
import { lineTotalPaise } from "@/lib/money";
import { quoteOffer } from "@/lib/offers/quote";
import { offerLifecycle, type OfferRow } from "@/lib/offers/types";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { saveAccountPhoneAndAddress } from "@/lib/checkout/save-account";

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
  method?: "UPI";
  lines: CheckoutLineInput[];
  couponCode?: string;
  gstin?: string;
};

export type PlaceOrderResult = { error?: string; orderNumber?: string; orderId?: string; totalPaise?: number };

const OFFER_COLUMNS =
  "id, name, description, kind, coupon_code, percent_off, amount_off_paise, min_order_paise, max_discount_paise, gift_product_id, applicable_product_ids, applicable_category_ids, filter_eggless, filter_vegetarian, filter_bestseller, filter_new_arrival, banner_text, show_banner, starts_at, ends_at, is_active, usage_limit, created_at";

function nextOrderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `CC-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

function parseGstin(raw: string | undefined): { gstin: string | null; error?: string } {
  const gstin = (raw ?? "").trim().toUpperCase();
  if (!gstin) return { gstin: null };
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin)) {
    return { gstin: null, error: "GSTIN should be 15 characters, like 27AAAAA0000A1Z5" };
  }
  return { gstin };
}

type ProductJoin = {
  id: string;
  name: string;
  status: string;
  deleted_at: string | null;
  primary_category_id: string | null;
  is_eggless: boolean;
  is_vegetarian: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
};

function unwrapProduct(raw: ProductJoin | ProductJoin[] | null): ProductJoin | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
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
  if (payload.method && payload.method !== "UPI") {
    return { error: "Pay with UPI QR. Cash on delivery is not available" };
  }
  const gst = parseGstin(payload.gstin);
  if (gst.error) return { error: gst.error };

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
    .select(
      "id, sku, name, price_paise, status, product_id, products:product_id (id, name, status, deleted_at, primary_category_id, is_eggless, is_vegetarian, is_bestseller, is_new_arrival)",
    )
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
    categoryId: string | null;
    isEggless: boolean;
    isVegetarian: boolean;
    isBestseller: boolean;
    isNewArrival: boolean;
  }[] = [];

  for (const line of lines) {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant) {
      return { error: "An item in your bag is no longer for sale. Remove it and try again." };
    }
    const product = unwrapProduct(variant.products as ProductJoin | ProductJoin[] | null);
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
      categoryId: product.primary_category_id,
      isEggless: Boolean(product.is_eggless),
      isVegetarian: Boolean(product.is_vegetarian),
      isBestseller: Boolean(product.is_bestseller),
      isNewArrival: Boolean(product.is_new_arrival),
    });
  }

  const subtotal = priced.reduce((sum, l) => sum + l.line, 0);
  let discountPaise = 0;
  let couponCode: string | null = null;
  let giftLine: {
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
  } | null = null;
  let appliedOffer: OfferRow | null = null;

  const requestedCode = (payload.couponCode ?? "").trim().toUpperCase();
  if (requestedCode) {
    const { data: offerRow } = await db.from("offers").select(OFFER_COLUMNS).eq("coupon_code", requestedCode).maybeSingle();
    const offer = offerRow as OfferRow | null;
    if (!offer || offerLifecycle(offer) !== "live") {
      return { error: "That coupon is not live" };
    }
    if (offer.usage_limit != null) {
      const { count } = await db
        .from("offer_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("offer_id", offer.id);
      if ((count ?? 0) >= offer.usage_limit) {
        return { error: "This offer has been fully used" };
      }
    }
    const quoted = quoteOffer(
      offer,
      priced.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPaise: l.unit,
        categoryId: l.categoryId,
        isEggless: l.isEggless,
        isVegetarian: l.isVegetarian,
        isBestseller: l.isBestseller,
        isNewArrival: l.isNewArrival,
      })),
    );
    if ("error" in quoted) return { error: quoted.error };
    discountPaise = quoted.discountPaise;
    couponCode = offer.coupon_code;
    appliedOffer = offer;
    if (quoted.giftProductId) {
      const { data: giftVariant } = await db
        .from("product_variants")
        .select("id, sku, name, product_id, products:product_id (id, name, status)")
        .eq("product_id", quoted.giftProductId)
        .eq("status", "ACTIVE")
        .is("deleted_at", null)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      const giftProductRaw = giftVariant?.products as { id: string; name: string; status: string } | { id: string; name: string; status: string }[] | null;
      const giftProduct = Array.isArray(giftProductRaw) ? giftProductRaw[0] : giftProductRaw;
      if (!giftVariant || !giftProduct || giftProduct.status !== "ACTIVE") {
        return { error: "The free gift is no longer available" };
      }
      giftLine = {
        productId: giftProduct.id,
        variantId: giftVariant.id,
        productName: giftProduct.name,
        variantName: giftVariant.name,
        sku: giftVariant.sku,
      };
    }
  }

  const total = Math.max(0, subtotal - discountPaise);
  const user = await getAuthUser();
  if (!user) {
    return { error: "Sign in to place an order so we can save your phone and address" };
  }

  const saved = await saveAccountPhoneAndAddress(db, user.userId, {
    name,
    phone,
    line1,
    landmark: payload.landmark.trim(),
    city,
    pincode,
    notes: payload.notes.trim(),
  });
  if (saved.error) return { error: saved.error };

  const { data: location } = await db.from("locations").select("id").eq("is_active", true).limit(1).maybeSingle();
  const orderNumber = nextOrderNumber();

  const { data: order, error } = await db
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.userId,
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
        gstin: gst.gstin,
      },
      fulfillment_method: "DELIVERY",
      customer_notes: payload.notes.trim() || null,
      subtotal_paise: subtotal,
      discount_paise: discountPaise,
      delivery_fee_paise: appliedOffer?.kind === "FREE_DELIVERY" ? 0 : 0,
      total_paise: total,
      coupon_code: couponCode,
      channel: "WEB",
    })
    .select("id")
    .single();
  if (error || !order) {
    return { error: error?.message ?? "Could not place the order" };
  }

  const orderItems = priced.map((l) => ({
    order_id: order.id,
    product_id: l.productId,
    variant_id: l.variantId,
    product_name: l.productName,
    variant_name: l.variantName,
    sku: l.sku,
    quantity: l.quantity,
    unit_price_paise: l.unit,
    line_total_paise: l.line,
  }));
  if (giftLine) {
    orderItems.push({
      order_id: order.id,
      product_id: giftLine.productId,
      variant_id: giftLine.variantId,
      product_name: `${giftLine.productName} (gift)`,
      variant_name: giftLine.variantName,
      sku: giftLine.sku,
      quantity: 1,
      unit_price_paise: 0,
      line_total_paise: 0,
    });
  }

  const { error: itemsError } = await db.from("order_items").insert(orderItems);
  if (itemsError) {
    return { error: itemsError.message };
  }

  if (appliedOffer) {
    await db.from("offer_redemptions").insert({
      offer_id: appliedOffer.id,
      order_id: order.id,
      user_id: user.userId,
      discount_paise: discountPaise,
      gift_product_id: giftLine?.productId ?? null,
    });
  }

  await db.from("order_status_history").insert({
    order_id: order.id,
    from_status: null,
    to_status: "PLACED",
    note: "Placed — UPI QR, confirm when paid",
    changed_by: user.userId,
  });

  await db.from("payments").insert({
    order_id: order.id,
    provider: "MANUAL",
    status: "PENDING",
    amount_paise: total,
    provider_reference: "UPI_QR",
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/offers");
  revalidatePath("/account/orders");
  revalidatePath("/account");
  revalidatePath("/account/addresses");
  return { orderNumber, orderId: order.id, totalPaise: total };
}
