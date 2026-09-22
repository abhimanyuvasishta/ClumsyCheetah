import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProductStatus } from "@/types/catalog";

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: ProductStatus;
  thumbnail_url: string | null;
  is_bestseller: boolean;
  updated_at: string;
  categories: { name: string; slug: string } | null;
  product_variants: { price_paise: number; sku: string; status: string }[] | null;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: ProductStatus;
  thumbnail_url: string | null;
  is_bestseller: boolean;
  updated_at: string;
  categories: { name: string; slug: string } | null;
  short_description: string | null;
  long_description: string | null;
  primary_category_id: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_vegetarian: boolean;
  is_eggless: boolean;
  contains_egg: boolean;
  allergen_info: string | null;
  ingredients: string | null;
  seo_title: string | null;
  seo_description: string | null;
  product_variants: {
    id: string;
    sku: string;
    name: string;
    flavour: string | null;
    weight_label: string | null;
    price_paise: number;
    compare_at_paise: number | null;
    status: "ACTIVE" | "INACTIVE";
    sort_order: number;
  }[] | null;
};

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, status, thumbnail_url, is_bestseller, updated_at, categories:primary_category_id (name, slug), product_variants (price_paise, sku, status)",
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as unknown as AdminProductRow[];
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, status, thumbnail_url, is_bestseller, is_featured, is_new_arrival, is_vegetarian, is_eggless, contains_egg, updated_at, short_description, long_description, primary_category_id, allergen_info, ingredients, seo_title, seo_description, categories:primary_category_id (name, slug), product_variants (id, sku, name, flavour, weight_label, price_paise, compare_at_paise, status, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as AdminProductDetail;
}

export async function listAdminCategories() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("categories").select("id, name, slug").eq("is_active", true).order("sort_order");
  return data ?? [];
}
