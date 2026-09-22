"use server";

import { revalidatePath } from "next/cache";
import { staffDb, requireStaff } from "@/lib/admin/access";
import { CATALOG_WRITE_ROLES } from "@/types/roles";
import { mergeStorefrontConfig, STOREFRONT_SETTINGS_KEY } from "@/lib/storefront/config";

export type AppearanceState = { error?: string; ok?: boolean };

export async function saveStorefrontAppearance(_: AppearanceState, form: FormData): Promise<AppearanceState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const raw = String(form.get("payload") ?? "");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: "The editor could not read that save." };
    }
    const value = mergeStorefrontConfig(parsed);
    const supabase = await staffDb();
    const { error } = await supabase.from("site_settings").upsert({
      key: STOREFRONT_SETTINGS_KEY,
      value,
      updated_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    revalidatePath("/admin/appearance");
    return { ok: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not publish" };
  }
}
