import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DatabaseEnums } from "@/types/database";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  status: DatabaseEnums["order_status"];
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  total_paise: number;
  placed_at: string;
  channel: string;
};

export type AdminOrderDetail = AdminOrderRow & {
  staff_notes: string | null;
  customer_notes: string | null;
  gift_message: string | null;
  fulfillment_method: string;
  delivery_slot_label: string | null;
  subtotal_paise: number;
  discount_paise: number;
  delivery_fee_paise: number;
  tax_paise: number;
  order_items: {
    id: string;
    product_name: string;
    variant_name: string | null;
    sku: string | null;
    quantity: number;
    unit_price_paise: number;
    line_total_paise: number;
  }[];
  order_status_history: {
    id: string;
    from_status: string | null;
    to_status: string;
    note: string | null;
    created_at: string;
  }[];
};

export async function listAdminOrders(status?: string): Promise<AdminOrderRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  let query = supabase
    .from("orders")
    .select("id, order_number, status, contact_name, contact_phone, contact_email, total_paise, placed_at, channel")
    .order("placed_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as AdminOrderRow[];
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, contact_name, contact_phone, contact_email, total_paise, placed_at, channel, staff_notes, customer_notes, gift_message, fulfillment_method, delivery_slot_label, subtotal_paise, discount_paise, delivery_fee_paise, tax_paise, order_items (id, product_name, variant_name, sku, quantity, unit_price_paise, line_total_paise), order_status_history (id, from_status, to_status, note, created_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as AdminOrderDetail;
  row.order_status_history = [...(row.order_status_history ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return row;
}

export async function listSellableVariants() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("product_variants")
    .select("id, sku, name, price_paise, products:product_id (name, status)")
    .eq("status", "ACTIVE")
    .is("deleted_at", null)
    .limit(400);
  return (data ?? []).filter((row) => {
    const p = row.products as { status?: string } | null;
    return p?.status === "ACTIVE";
  });
}
