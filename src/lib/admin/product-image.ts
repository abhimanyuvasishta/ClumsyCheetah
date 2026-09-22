import type { SupabaseClient } from "@supabase/supabase-js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export function formImageFile(form: FormData, key = "image"): File | null {
  const value = form.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}

export async function storeProductImage(
  supabase: SupabaseClient,
  productId: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED.has(file.type)) {
    return { error: "Use a JPG, PNG, WebP, GIF, or AVIF image" };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 8 MB or smaller" };
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { error: error.message };
  }
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
