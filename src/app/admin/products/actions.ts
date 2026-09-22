"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { privilegedDb, requireStaff, staffDb } from "@/lib/admin/access";
import { rupeesToPaise } from "@/lib/money";
import { slugify } from "@/lib/slug";
import { CATALOG_WRITE_ROLES } from "@/types/roles";

export type ActionState = { error?: string; ok?: boolean };

function formString(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function formBool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const supabase = await staffDb();
  let candidate = slugify(base);
  for (let i = 0; i < 12; i += 1) {
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    candidate = `${slugify(base)}-${i + 2}`;
  }
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

export async function createProduct(_: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const name = formString(form, "name");
    if (!name) return { error: "Name is required" };
    const slug = await uniqueSlug(formString(form, "slug") || name);
    const pricePaise = rupeesToPaise(formString(form, "price_rupees") || "0");
    if (pricePaise <= 0) return { error: "Enter a selling price in rupees (server stores paise)" };
    const sku = formString(form, "sku") || `SKU-${Date.now().toString(36).toUpperCase()}`;
    const variantSku = formString(form, "variant_sku") || `${sku}-1`;
    const variantName = formString(form, "variant_name") || "Default";
    const categoryId = formString(form, "primary_category_id") || null;

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        sku,
        short_description: formString(form, "short_description") || null,
        long_description: formString(form, "long_description") || null,
        primary_category_id: categoryId,
        thumbnail_url: formString(form, "thumbnail_url") || null,
        status: formString(form, "status") || "DRAFT",
        is_featured: formBool(form, "is_featured"),
        is_bestseller: formBool(form, "is_bestseller"),
        is_new_arrival: formBool(form, "is_new_arrival"),
        is_vegetarian: formBool(form, "is_vegetarian"),
        is_eggless: formBool(form, "is_eggless"),
        contains_egg: formBool(form, "contains_egg"),
      })
      .select("id")
      .single();
    if (error || !product) return { error: error?.message ?? "Could not create product" };

    const { error: variantError } = await supabase.from("product_variants").insert({
      product_id: product.id,
      sku: variantSku,
      name: variantName,
      price_paise: pricePaise,
      compare_at_paise: formString(form, "compare_rupees") ? rupeesToPaise(formString(form, "compare_rupees")) : null,
      status: "ACTIVE",
      sort_order: 1,
    });
    if (variantError) return { error: variantError.message };

    if (categoryId) {
      await supabase.from("product_categories").upsert({ product_id: product.id, category_id: categoryId });
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    redirect(`/admin/products/${product.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : "Could not create product" };
  }
}

export async function updateProduct(productId: string, _: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const name = formString(form, "name");
    if (!name) return { error: "Name is required" };
    const slug = await uniqueSlug(formString(form, "slug") || name, productId);
    const categoryId = formString(form, "primary_category_id") || null;
    const { error } = await supabase
      .from("products")
      .update({
        name,
        slug,
        sku: formString(form, "sku") || null,
        short_description: formString(form, "short_description") || null,
        long_description: formString(form, "long_description") || null,
        primary_category_id: categoryId,
        thumbnail_url: formString(form, "thumbnail_url") || null,
        status: formString(form, "status") || "DRAFT",
        is_featured: formBool(form, "is_featured"),
        is_bestseller: formBool(form, "is_bestseller"),
        is_new_arrival: formBool(form, "is_new_arrival"),
        is_vegetarian: formBool(form, "is_vegetarian"),
        is_eggless: formBool(form, "is_eggless"),
        contains_egg: formBool(form, "contains_egg"),
        allergen_info: formString(form, "allergen_info") || null,
        ingredients: formString(form, "ingredients") || null,
        seo_title: formString(form, "seo_title") || null,
        seo_description: formString(form, "seo_description") || null,
        archived_at: formString(form, "status") === "ARCHIVED" ? new Date().toISOString() : null,
      })
      .eq("id", productId);
    if (error) return { error: error.message };
    if (categoryId) {
      await supabase.from("product_categories").upsert({ product_id: productId, category_id: categoryId });
    }
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save product" };
  }
}

export async function addVariant(productId: string, _: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const sku = formString(form, "sku");
    const name = formString(form, "name");
    if (!sku || !name) return { error: "Variant SKU and name are required" };
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      sku,
      name,
      flavour: formString(form, "flavour") || null,
      weight_label: formString(form, "weight_label") || null,
      price_paise: rupeesToPaise(formString(form, "price_rupees") || "0"),
      compare_at_paise: formString(form, "compare_rupees") ? rupeesToPaise(formString(form, "compare_rupees")) : null,
      status: "ACTIVE",
      sort_order: Number(formString(form, "sort_order") || "0"),
    });
    if (error) return { error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not add variant" };
  }
}

export async function updateVariant(productId: string, variantId: string, _: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const { error } = await supabase
      .from("product_variants")
      .update({
        sku: formString(form, "sku"),
        name: formString(form, "name"),
        flavour: formString(form, "flavour") || null,
        weight_label: formString(form, "weight_label") || null,
        price_paise: rupeesToPaise(formString(form, "price_rupees") || "0"),
        compare_at_paise: formString(form, "compare_rupees") ? rupeesToPaise(formString(form, "compare_rupees")) : null,
        status: formString(form, "status") || "ACTIVE",
      })
      .eq("id", variantId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not update variant" };
  }
}

export async function setProductStatus(productId: string, status: "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DRAFT") {
  await requireStaff(CATALOG_WRITE_ROLES);
  const supabase = await staffDb();
  const { error } = await supabase
    .from("products")
    .update({
      status,
      archived_at: status === "ARCHIVED" ? new Date().toISOString() : null,
      deleted_at: null,
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function duplicateProduct(productId: string) {
  await requireStaff(CATALOG_WRITE_ROLES);
  const supabase = await staffDb();
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).single();
  if (error || !product) throw new Error(error?.message ?? "Product not found");
  const { data: variants } = await supabase.from("product_variants").select("*").eq("product_id", productId).is("deleted_at", null);
  const slug = await uniqueSlug(`${product.name} copy`);
  const { data: copy, error: copyError } = await supabase
    .from("products")
    .insert({
      name: `${product.name} (copy)`,
      slug,
      sku: product.sku ? `${product.sku}-COPY` : null,
      short_description: product.short_description,
      long_description: product.long_description,
      primary_category_id: product.primary_category_id,
      tags: product.tags,
      thumbnail_url: product.thumbnail_url,
      is_featured: false,
      is_bestseller: false,
      is_new_arrival: true,
      is_vegetarian: product.is_vegetarian,
      is_eggless: product.is_eggless,
      contains_egg: product.contains_egg,
      allergen_info: product.allergen_info,
      ingredients: product.ingredients,
      status: "DRAFT",
      seo_title: product.seo_title,
      seo_description: product.seo_description,
    })
    .select("id")
    .single();
  if (copyError || !copy) throw new Error(copyError?.message ?? "Could not duplicate");
  if (variants?.length) {
    await supabase.from("product_variants").insert(
      variants.map((v, i) => ({
        product_id: copy.id,
        sku: `${v.sku}-C${Date.now().toString(36).slice(-4)}${i}`,
        name: v.name,
        flavour: v.flavour,
        weight_grams: v.weight_grams,
        weight_label: v.weight_label,
        price_paise: v.price_paise,
        compare_at_paise: v.compare_at_paise,
        status: v.status,
        sort_order: v.sort_order,
      })),
    );
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

export async function clearAllProducts(form: FormData) {
  await requireStaff(CATALOG_WRITE_ROLES);
  if (String(form.get("confirm") ?? "").trim() !== "DELETE") {
    throw new Error("Type DELETE to remove every product");
  }
  const db = await privilegedDb(CATALOG_WRITE_ROLES);
  await db.from("order_items").update({ product_id: null, variant_id: null }).not("id", "is", null);
  await db.from("inventory_movements").delete().neq("id", "00000000-0000-4000-8000-000000000000");
  await db.from("inventory").delete().neq("id", "00000000-0000-4000-8000-000000000000");
  await db.from("collection_products").delete().neq("product_id", "00000000-0000-4000-8000-000000000000");
  await db.from("product_tags").delete().neq("product_id", "00000000-0000-4000-8000-000000000000");
  await db.from("product_categories").delete().neq("product_id", "00000000-0000-4000-8000-000000000000");
  await db.from("product_images").delete().neq("id", "00000000-0000-4000-8000-000000000000");
  await db.from("product_variants").delete().neq("id", "00000000-0000-4000-8000-000000000000");
  const { error } = await db.from("products").delete().neq("id", "00000000-0000-4000-8000-000000000000");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}
