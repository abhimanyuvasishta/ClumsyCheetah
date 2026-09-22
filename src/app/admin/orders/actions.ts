"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { privilegedDb, requireStaff } from "@/lib/admin/access";
import { lineTotalPaise } from "@/lib/money";
import { ORDER_WRITE_ROLES } from "@/types/roles";
import type { DatabaseEnums } from "@/types/database";
import { allowedNextStatuses } from "@/lib/admin/order-status";

export type OrderActionState = { error?: string; ok?: boolean };

async function orderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `CC-${y}${m}${day}-${rand}`;
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

    const { data: order, error } = await db
      .from("orders")
      .insert({
        order_number: await orderNumber(),
        location_id: location?.id ?? null,
        status: "PLACED",
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
