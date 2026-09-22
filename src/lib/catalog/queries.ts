import { lowestVariantPricePaise } from "@/lib/catalog/pricing";
import type { CatalogCategory, CatalogCollection, CatalogProduct, CatalogVariant, ShopFilters } from "@/types/catalog";
import {
  collectionProductSlugs,
  seedCategories,
  seedCollections,
  seedProducts,
} from "@/data/catalog-seed";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

function lowestPrice(product: CatalogProduct): number {
  return lowestVariantPricePaise(product);
}

function applyFilters(products: CatalogProduct[], filters: ShopFilters = {}): CatalogProduct[] {
  let list = products.filter((p) => p.status === "ACTIVE");

  if (filters.category) {
    list = list.filter((p) => p.category?.slug === filters.category);
  }
  if (filters.eggless) {
    list = list.filter((p) => p.isEggless);
  }
  if (filters.vegetarian) {
    list = list.filter((p) => p.isVegetarian);
  }
  if (filters.bestseller) {
    list = list.filter((p) => p.isBestseller);
  }
  if (filters.newArrival) {
    list = list.filter((p) => p.isNewArrival);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((p) => {
      const hay = [p.name, p.shortDescription, p.longDescription, p.category?.name, ...(p.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  switch (filters.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b));
      break;
    case "price-desc":
      list = [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a));
      break;
    case "newest":
    case "bestselling":
    case "popular":
    default:
      list = [...list].sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || Number(b.isFeatured) - Number(a.isFeatured));
  }

  return list;
}

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  long_description: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_vegetarian: boolean;
  is_eggless: boolean;
  contains_egg: boolean;
  allergen_info: string | null;
  ingredients: string | null;
  serving_size: string | null;
  preparation_time_hours: number | null;
  shelf_life: string | null;
  storage_instructions: string | null;
  status: CatalogProduct["status"];
  seo_title: string | null;
  seo_description: string | null;
  categories: { id: string; name: string; slug: string; description: string | null; image_url: string | null; sort_order: number } | null;
  product_variants: Array<{
    id: string;
    product_id: string;
    sku: string;
    name: string;
    flavour: string | null;
    weight_grams: number | null;
    weight_label: string | null;
    price_paise: number;
    compare_at_paise: number | null;
    status: "ACTIVE" | "INACTIVE";
    unlimited_inventory: boolean;
    min_order_qty: number;
    max_order_qty: number | null;
    sort_order: number;
  }> | null;
  product_images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
    is_primary: boolean;
  }> | null;
};

function mapProduct(row: ProductRow): CatalogProduct {
  const variants: CatalogVariant[] = (row.product_variants ?? [])
    .filter((v) => v.status === "ACTIVE")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      productId: v.product_id,
      sku: v.sku,
      name: v.name,
      flavour: v.flavour,
      weightGrams: v.weight_grams,
      weightLabel: v.weight_label,
      pricePaise: v.price_paise,
      compareAtPaise: v.compare_at_paise,
      status: v.status,
      unlimitedInventory: v.unlimited_inventory,
      minOrderQty: v.min_order_qty,
      maxOrderQty: v.max_order_qty,
      sortOrder: v.sort_order,
      availableQty: null,
    }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    category: row.categories
      ? {
          id: row.categories.id,
          name: row.categories.name,
          slug: row.categories.slug,
          description: row.categories.description,
          imageUrl: row.categories.image_url,
          sortOrder: row.categories.sort_order,
        }
      : null,
    tags: row.tags ?? [],
    thumbnailUrl: row.thumbnail_url,
    isFeatured: row.is_featured,
    isBestseller: row.is_bestseller,
    isNewArrival: row.is_new_arrival,
    isVegetarian: row.is_vegetarian,
    isEggless: row.is_eggless,
    containsEgg: row.contains_egg,
    allergenInfo: row.allergen_info,
    ingredients: row.ingredients,
    servingSize: row.serving_size,
    preparationTimeHours: row.preparation_time_hours,
    shelfLife: row.shelf_life,
    storageInstructions: row.storage_instructions,
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    variants,
    images: (row.product_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sort_order,
        isPrimary: img.is_primary,
      })),
  };
}

const productSelect = `
  id, name, slug, sku, short_description, long_description, tags, thumbnail_url,
  is_featured, is_bestseller, is_new_arrival, is_vegetarian, is_eggless, contains_egg,
  allergen_info, ingredients, serving_size, preparation_time_hours, shelf_life, storage_instructions,
  status, seo_title, seo_description,
  categories:primary_category_id (id, name, slug, description, image_url, sort_order),
  product_variants (*),
  product_images (*)
`;

export async function listCategories(): Promise<CatalogCategory[]> {
  if (!isSupabaseConfigured()) {
    return seedCategories;
  }
  const supabase = await createPublicSupabaseClient();
  if (!supabase) return seedCategories;
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order");
  if (error || !data?.length) {
    return seedCategories;
  }
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function listCollections(): Promise<CatalogCollection[]> {
  if (!isSupabaseConfigured()) {
    return seedCollections;
  }
  const supabase = await createPublicSupabaseClient();
  if (!supabase) return seedCollections;
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url, collection_type")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order");
  if (error || !data?.length) {
    return seedCollections;
  }
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    collectionType: row.collection_type,
  }));
}

export async function listProducts(filters: ShopFilters = {}): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    return applyFilters(seedProducts, filters);
  }
  const supabase = await createPublicSupabaseClient();
  if (!supabase) return applyFilters(seedProducts, filters);

  let query = supabase.from("products").select(productSelect).eq("status", "ACTIVE").is("deleted_at", null);

  if (filters.eggless) query = query.eq("is_eggless", true);
  if (filters.vegetarian) query = query.eq("is_vegetarian", true);
  if (filters.bestseller) query = query.eq("is_bestseller", true);
  if (filters.newArrival) query = query.eq("is_new_arrival", true);

  const { data, error } = await query;
  if (error) {
    return applyFilters(seedProducts, filters);
  }

  const mapped = ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
  const withCategory = filters.category
    ? mapped.filter((p) => p.category?.slug === filters.category)
    : mapped;
  return applyFilters(withCategory, { ...filters, category: undefined, eggless: undefined, vegetarian: undefined, bestseller: undefined, newArrival: undefined });
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const all = await listProducts();
  const found = all.find((p) => p.slug === slug);
  if (found) return found;
  if (isSupabaseConfigured()) return null;
  return seedProducts.find((p) => p.slug === slug) ?? null;
}

export async function listProductsByCollection(slug: string): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    const slugs = collectionProductSlugs[slug] ?? [];
    if (slugs.length) {
      return seedProducts.filter((p) => slugs.includes(p.slug));
    }
    return seedProducts.filter((p) => p.category?.slug === slug);
  }

  const supabase = await createPublicSupabaseClient();
  if (!supabase) {
    const slugs = collectionProductSlugs[slug] ?? [];
    if (slugs.length) {
      return seedProducts.filter((p) => slugs.includes(p.slug));
    }
    return seedProducts.filter((p) => p.category?.slug === slug);
  }

  const { data: collection } = await supabase.from("collections").select("id").eq("slug", slug).maybeSingle();
  if (collection) {
    const { data } = await supabase
      .from("collection_products")
      .select(`sort_order, products:product_id (${productSelect})`)
      .eq("collection_id", collection.id)
      .order("sort_order");
    if (data?.length) {
      return data
        .map((row) => {
          const product = (row as unknown as { products: ProductRow | ProductRow[] | null }).products;
          const value = Array.isArray(product) ? product[0] : product;
          return value ? mapProduct(value) : null;
        })
        .filter((p): p is CatalogProduct => Boolean(p));
    }
  }

  return listProducts({ category: slug });
}

export async function listRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  const all = await listProducts({ category: product.category?.slug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}
