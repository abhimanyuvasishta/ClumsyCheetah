"use server";

import { revalidatePath } from "next/cache";
import { privilegedDb, requireStaff } from "@/lib/admin/access";
import { formImageFile, storeBrandImage } from "@/lib/admin/product-image";
import { CATALOG_WRITE_ROLES } from "@/types/roles";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import { mergeStorefrontConfig, STOREFRONT_SETTINGS_KEY, type BrandAssets } from "@/lib/storefront/config";

export type BrandState = { error?: string; ok?: boolean };

async function saveBrand(patch: Partial<BrandAssets>): Promise<BrandState> {
  await requireStaff(CATALOG_WRITE_ROLES);
  const current = await getStorefrontConfig();
  const value = mergeStorefrontConfig({
    ...current,
    brand: { ...current.brand, ...patch },
  });
  const supabase = await privilegedDb(CATALOG_WRITE_ROLES);
  const { error } = await supabase.from("site_settings").upsert({
    key: STOREFRONT_SETTINGS_KEY,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
  return { ok: true };
}

export async function uploadBrandAsset(_: BrandState, form: FormData): Promise<BrandState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const kindRaw = String(form.get("kind") ?? "");
    const kind = kindRaw === "logo" || kindRaw === "icon" || kindRaw === "favicon" ? kindRaw : null;
    if (!kind) return { error: "Choose logo, icon, or favicon" };
    const file = formImageFile(form, "file");
    if (!file) return { error: "Choose an image file" };
    const uploaded = await storeBrandImage(await privilegedDb(CATALOG_WRITE_ROLES), kind, file);
    if ("error" in uploaded) return { error: uploaded.error };
    const key = kind === "logo" ? "logoUrl" : kind === "icon" ? "iconUrl" : "faviconUrl";
    return saveBrand({ [key]: uploaded.url });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not upload" };
  }
}

export async function clearBrandAsset(kind: "logo" | "icon" | "favicon"): Promise<BrandState> {
  try {
    const fallback = "/brand/logo.png";
    const key = kind === "logo" ? "logoUrl" : kind === "icon" ? "iconUrl" : "faviconUrl";
    return await saveBrand({ [key]: fallback });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reset" };
  }
}
