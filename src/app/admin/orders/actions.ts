"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { privilegedDb, requireStaff } from "@/lib/admin/access";
import { lineTotalPaise } from "@/lib/money";
import { ORDER_WRITE_ROLES } from "@/types/roles";
import type { DatabaseEnums } from "@/types/database";
import { allowedNextStatuses } from "@/lib/admin/order-status";
import { hoursFromProducts, isQuarterHour, promisedAtFromNow, sanitizeEtaMessage } from "@/lib/orders/eta";
import { istCalendarStamp } from "@/lib/time";

export type OrderActionState = { error?: string; ok?: boolean };

async function orderNumber() {
  return `CC-${istCalendarStamp()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function createManualOrder(_: OrderActionState, form: FormData): Promise<OrderActionState> {
  try {
    const staff = await requireStaff(ORDER_WRITE_ROLES);
    const db = await privilegedDb(ORDER_WRITE_ROLES);
    const name = String(form.get("contact_name") ?? "").trim();
    const phone = String(form.get("contact_phone") ?? "").trim();
    const email = String(form.get("contact_email") ?? "").trim();
    const variantId = String(form.get("variant_id") ?? "").trim();
    const qty = Number(form.get("quantity") ?? 1);
    if (!name || !phone || !variantId) return { error: "Name, phone, and a variant are required" };
    if (!Number.isInteger(qty) || qty < 1) return { error: "Quantity must be a whole number ≥ 1" };

    const { data: variant, error: vErr } = await db
      .from("product_variants")
      .select("id, sku, name, price_paise, product_id, products:product_id (name)")
      .eq("id", variantId)
      .single();
    if (vErr || !variant) return { error: vErr?.message ?? "Variant not found" };
    const unit = variant.price_paise as number;
    const line = lineTotalPaise(unit, qty);
    const productRel = variant.products as { name?: string } | { name?: string }[] | null;
    const productName = Array.isArray(productRel) ? productRel[0]?.name : productRel?.name;

    const { data: location } = await db.from("locations").select("id").eq("is_active", true).limit(1).maybeSingle();
    const { data: etaProduct } = await db
      .from("products")
      .select("preparation_time_hours, delivery_time_hours")
      .eq("id", variant.product_id)
      .maybeSingle();

    const { data: order, error } = await db
      .from("orders")
      .insert({
        order_number: await orderNumber(),
        location_id: location?.id ?? null,
        status: "PLACED",
        promised_at: promisedAtFromNow(hoursFromProducts(etaProduct ? [etaProduct] : [])),
        contact_name: name,
        contact_phone: phone,
        contact_email: email || null,
        shipping_address: {},
        fulfillment_method: "DELIVERY",
        staff_notes: String(form.get("staff_notes") ?? "").trim() || null,
        subtotal_paise: line,
        total_paise: line,
        channel: "ADMIN",
      })
      .select("id")
      .single();
    if (error || !order) return { error: error?.message ?? "Could not create order" };

    await db.from("order_items").insert({
      order_id: order.id,
      product_id: variant.product_id,
      variant_id: variant.id,
        product_name: productName ?? "Item",
      variant_name: variant.name,
      sku: variant.sku,
      quantity: qty,
      unit_price_paise: unit,
      line_total_paise: line,
    });
    await db.from("order_status_history").insert({
      order_id: order.id,
      from_status: null,
      to_status: "PLACED",
      note: "Created in admin",
      changed_by: staff.userId,
    });
    await db.from("payments").insert({
      order_id: order.id,
      provider: "MANUAL",
      status: "PENDING",
      amount_paise: line,
    });

    revalidatePath("/admin/orders");
    redirect(`/admin/orders/${order.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : "Could not create order" };
  }
}

export async function updateOrderStatus(orderId: string, toStatus: DatabaseEnums["order_status"]) {
  const staff = await requireStaff(ORDER_WRITE_ROLES);
  const db = await privilegedDb(ORDER_WRITE_ROLES);
  const { data: order, error } = await db.from("orders").select("id, status").eq("id", orderId).single();
  if (error || !order) throw new Error(error?.message ?? "Order not found");
  const next = allowedNextStatuses(order.status as DatabaseEnums["order_status"]);
  if (!next.includes(toStatus)) throw new Error(`Cannot move ${order.status} to ${toStatus}`);
  const { error: upErr } = await db
    .from("orders")
    .update({
      status: toStatus,
      cancelled_at: toStatus === "CANCELLED" ? new Date().toISOString() : null,
    })
    .eq("id", orderId);
  if (upErr) throw new Error(upErr.message);
  await db.from("order_status_history").insert({
    order_id: orderId,
    from_status: order.status,
    to_status: toStatus,
    note: null,
    changed_by: staff.userId,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/account", "layout");
}

const ETA_DELTAS = new Set([-60, -30, 30, 60]);

export async function updateOrderEta(orderId: string, form: FormData) {
  await requireStaff(ORDER_WRITE_ROLES);
  const db = await privilegedDb(ORDER_WRITE_ROLES);
  const { data: order, error } = await db.from("orders").select("id, promised_at").eq("id", orderId).single();
  if (error || !order) throw new Error(error?.message ?? "Order not found");

  const patch: { promised_at?: string; eta_message: string | null } = {
    eta_message: sanitizeEtaMessage(String(form.get("eta_message") ?? "")),
  };

  const deltaRaw = form.get("delta_minutes");
  const promisedRaw = String(form.get("promised_at") ?? "").trim();
  const intent = String(form.get("intent") ?? "");

  if (deltaRaw != null && String(deltaRaw) !== "") {
    const deltaMinutes = Number(deltaRaw);
    if (!ETA_DELTAS.has(deltaMinutes)) throw new Error("Use the time buttons or the 15 minute list");
    const base = order.promised_at ? new Date(order.promised_at).getTime() : Date.now();
    patch.promised_at = new Date(Math.max(Date.now(), base + deltaMinutes * 60 * 1000)).toISOString();
  } else if (intent === "set") {
    if (!promisedRaw) throw new Error("Pick a time from the 15 minute list");
    const next = new Date(promisedRaw);
    if (Number.isNaN(next.getTime()) || !isQuarterHour(next)) throw new Error("Pick a time from the 15 minute list");
    const latest = Date.now() + 48 * 60 * 60 * 1000;
    if (next.getTime() < Date.now() - 60 * 1000 || next.getTime() > latest) {
      throw new Error("Pick a time between now and the next two days");
    }
    patch.promised_at = next.toISOString();
  }

  const { error: upErr } = await db.from("orders").update(patch).eq("id", orderId);
  if (upErr) throw new Error(upErr.message);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/account", "layout");
}

export async function saveStaffNotes(orderId: string, form: FormData) {
  await requireStaff(ORDER_WRITE_ROLES);
  const db = await privilegedDb(ORDER_WRITE_ROLES);
  const { error } = await db
    .from("orders")
    .update({ staff_notes: String(form.get("staff_notes") ?? "").trim() || null })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/orders/${orderId}`);
}
