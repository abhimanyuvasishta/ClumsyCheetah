"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { privilegedDb, requireStaff, staffDb } from "@/lib/admin/access";
import { formImageFile, storeProductImage } from "@/lib/admin/product-image";
import { slugify } from "@/lib/slug";
import { CATALOG_WRITE_ROLES } from "@/types/roles";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import { mergeStorefrontConfig, STOREFRONT_SETTINGS_KEY } from "@/lib/storefront/config";

export type CollectionState = { error?: string; ok?: boolean };

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

async function syncCollectionCopy(slug: string, heading: string, body: string) {
  const current = await getStorefrontConfig();
  const value = mergeStorefrontConfig({
    ...current,
    collections: { ...current.collections, [slug]: { heading, body } },
  });
  const supabase = await privilegedDb(CATALOG_WRITE_ROLES);
  await supabase.from("site_settings").upsert({
    key: STOREFRONT_SETTINGS_KEY,
    value,
    updated_at: new Date().toISOString(),
  });
}

export async function saveCollection(id: string | null, _: CollectionState, form: FormData): Promise<CollectionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const name = field(form, "name");
    if (!name) return { error: "Name is required" };
    const slug = slugify(field(form, "slug") || name);
    const description = field(form, "description") || null;
    const isActive = form.get("is_active") === "on";
    const sortOrder = Number(field(form, "sort_order") || "0") || 0;
    const productIds = form.getAll("product_id").map((value) => String(value)).filter(Boolean);
    const image = formImageFile(form);

    let rowId = id;
    if (!rowId) {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name,
          slug,
          description,
          is_active: isActive,
          sort_order: sortOrder,
        })
        .select("id")
        .single();
      if (error || !data) return { error: error?.message ?? "Could not create collection" };
      rowId = data.id as string;
    } else {
      const { error } = await supabase
        .from("collections")
        .update({ name, slug, description, is_active: isActive, sort_order: sortOrder, deleted_at: null })
        .eq("id", rowId);
      if (error) return { error: error.message };
    }

    if (image) {
      const uploaded = await storeProductImage(await privilegedDb(CATALOG_WRITE_ROLES), `collection-${rowId}`, image);
      if ("error" in uploaded) return { error: uploaded.error };
      await supabase.from("collections").update({ image_url: uploaded.url }).eq("id", rowId);
    }

    await supabase.from("collection_products").delete().eq("collection_id", rowId);
    if (productIds.length) {
      const { error } = await supabase.from("collection_products").insert(
        productIds.map((productId, index) => ({ collection_id: rowId, product_id: productId, sort_order: index })),
      );
      if (error) return { error: error.message };
    }

    await syncCollectionCopy(slug, field(form, "banner_heading") || name, field(form, "banner_body") || description || "");

    revalidatePath("/admin/collections");
    revalidatePath("/shop");
    revalidatePath(`/collections/${slug}`);
    revalidatePath("/", "layout");
    if (!id) redirect(`/admin/collections/${rowId}`);
    return { ok: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : "Could not save collection" };
  }
}

export async function deleteCollection(id: string) {
  await requireStaff(CATALOG_WRITE_ROLES);
  const supabase = await staffDb();
  await supabase.from("collections").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
  revalidatePath("/admin/collections");
  revalidatePath("/shop");
}
