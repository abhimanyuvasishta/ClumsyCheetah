"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SavedAddress = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type AddressState = { error?: string; ok?: boolean; address?: SavedAddress };

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function saveAddress(_: AddressState, form: FormData): Promise<AddressState> {
  const user = await getAuthUser();
  if (!user) return { error: "Sign in to save an address" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Could not save" };
  const fullName = field(form, "full_name");
  const phone = field(form, "phone");
  const line1 = field(form, "line1");
  const city = field(form, "city");
  const state = field(form, "state");
  const pincode = field(form, "pincode");
  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return { error: "Name, phone, address, city, state and PIN are required" };
  }
  const isDefault = form.get("is_default") === "on";
  if (isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.userId);
  }
  const { data, error } = await supabase.from("addresses").insert({
    user_id: user.userId,
    label: field(form, "label") || "Home",
    full_name: fullName,
    phone,
    line1,
    line2: field(form, "line2") || null,
    landmark: field(form, "landmark") || null,
    city,
    state,
    pincode,
    country: "IN",
    delivery_instructions: field(form, "delivery_instructions") || null,
    is_default: isDefault,
  }).select("id, label, full_name, phone, line1, line2, landmark, city, state, pincode, is_default").single();
  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true, address: data ?? undefined };
}

export async function deleteAddress(id: string) {
  const user = await getAuthUser();
  if (!user) return;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;
  await supabase.from("addresses").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.userId);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const user = await getAuthUser();
  if (!user) return;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.userId);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", user.userId);
  revalidatePath("/account/addresses");
}
