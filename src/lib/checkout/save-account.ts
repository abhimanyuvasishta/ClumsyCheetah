import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveAccountPhoneAndAddress(
  db: SupabaseClient,
  userId: string,
  details: {
    name: string;
    phone: string;
    line1: string;
    landmark: string;
    city: string;
    pincode: string;
    notes: string;
  },
): Promise<{ error?: string }> {
  const { data: profile } = await db.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle();
  if (!profile) {
    const { error: insertProfileError } = await db.from("profiles").insert({
      id: userId,
      phone: details.phone,
      full_name: details.name,
    });
    if (insertProfileError) return { error: insertProfileError.message };
  } else {
    const { error: profileError } = await db
      .from("profiles")
      .update({
        phone: profile.phone?.trim() ? profile.phone : details.phone,
        full_name: profile.full_name?.trim() ? profile.full_name : details.name,
      })
      .eq("id", userId);
    if (profileError) return { error: profileError.message };
  }

  const { count } = await db
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("deleted_at", null);
  if ((count ?? 0) > 0) return {};

  const { error: addressError } = await db.from("addresses").insert({
    user_id: userId,
    label: "Home",
    full_name: details.name,
    phone: details.phone,
    line1: details.line1,
    landmark: details.landmark || null,
    city: details.city,
    state: "Maharashtra",
    pincode: details.pincode,
    country: "IN",
    delivery_instructions: details.notes || null,
    is_default: true,
  });
  if (addressError) return { error: addressError.message };
  return {};
}
