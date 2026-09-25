"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProfileContactState = { error?: string; ok?: boolean };

export async function updateProfileContact(input: { name: string; phone: string }): Promise<ProfileContactState> {
  const user = await getAuthUser();
  if (!user) return { error: "Sign in to save your details" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Could not save" };
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!phone) return { error: "Add a phone number" };
  const patch: { phone: string; full_name?: string } = { phone };
  if (name) patch.full_name = name;
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.userId);
  if (error) return { error: error.message };
  revalidatePath("/account");
  revalidatePath("/checkout");
  return { ok: true };
}
