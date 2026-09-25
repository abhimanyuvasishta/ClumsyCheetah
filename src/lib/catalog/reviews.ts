import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
};

export async function listPublishedReviews(productId: string): Promise<ProductReview[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at")
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export function averageRating(reviews: ProductReview[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
