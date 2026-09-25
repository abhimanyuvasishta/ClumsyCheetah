"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean };

export async function submitProductReview(_: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await getAuthUser();
  if (!user) return { error: "Sign in to leave feedback" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Could not save feedback" };

  const orderId = String(form.get("order_id") ?? "").trim();
  const productId = String(form.get("product_id") ?? "").trim();
  const rating = Number(form.get("rating"));
  const body = String(form.get("body") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  if (!orderId || !productId) return { error: "Missing order or product" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Pick a rating from 1 to 5" };
  if (body.length < 8) return { error: "Tell us a little more about the bake (at least a sentence)" };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, order_items (product_id)")
    .eq("id", orderId)
    .eq("user_id", user.userId)
    .maybeSingle();
  if (!order || order.status !== "DELIVERED") {
    return { error: "Feedback opens after this order is delivered" };
  }
  const bought = (order.order_items ?? []).some((item) => item.product_id === productId);
  if (!bought) return { error: "That bake was not on this order" };

  const { error } = await supabase.from("reviews").insert({
    order_id: orderId,
    product_id: productId,
    user_id: user.userId,
    rating,
    title: title || null,
    body,
    is_published: true,
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) return { error: "You already left feedback for this bake" };
    return { error: error.message };
  }

  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  return { ok: true };
}
