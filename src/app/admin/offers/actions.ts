"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, staffDb } from "@/lib/admin/access";
import { rupeesToPaise } from "@/lib/money";
import { quoteOffer } from "@/lib/offers/quote";
import { getOfferByCode } from "@/lib/offers/public";
import { offerLifecycle } from "@/lib/offers/types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { CATALOG_WRITE_ROLES } from "@/types/roles";

export type ActionState = { error?: string; ok?: boolean };

function formString(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function formBool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

function formIds(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);
}

export async function createOffer(_: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireStaff(CATALOG_WRITE_ROLES);
    const supabase = await staffDb();
    const name = formString(form, "name");
    const kind = formString(form, "kind") as "PERCENTAGE" | "FIXED" | "FREE_DELIVERY" | "FREE_GIFT";
    const starts = formString(form, "starts_at");
    const ends = formString(form, "ends_at");
    if (!name) return { error: "Name the offer" };
    if (!starts || !ends) return { error: "Set a start and end" };
    const startsAt = new Date(starts);
    const endsAt = new Date(ends);
    if (!(endsAt > startsAt)) return { error: "End must be after start" };

    const coupon = formString(form, "coupon_code").toUpperCase() || null;
    const percent = formString(form, "percent_off") ? Number(formString(form, "percent_off")) : null;
    const amountOff = formString(form, "amount_off_rupees") ? rupeesToPaise(formString(form, "amount_off_rupees")) : null;
    const minOrder = formString(form, "min_order_rupees") ? rupeesToPaise(formString(form, "min_order_rupees")) : 0;
    const maxDiscount = formString(form, "max_discount_rupees")
      ? rupeesToPaise(formString(form, "max_discount_rupees"))
      : null;
    const gift = formString(form, "gift_product_id") || null;
    const usage = formString(form, "usage_limit") ? Number(formString(form, "usage_limit")) : null;

    if (kind === "PERCENTAGE" && (!percent || percent <= 0 || percent > 90)) {
      return { error: "Percent off must be between 1 and 90" };
    }
    if (kind === "FIXED" && (!amountOff || amountOff <= 0)) {
      return { error: "Enter a rupee amount off" };
    }
    if (kind === "FREE_GIFT" && !gift) {
      return { error: "Pick the free gift product" };
    }

    const { error } = await supabase.from("offers").insert({
      name,
      description: formString(form, "description") || null,
      kind,
      coupon_code: coupon,
      percent_off: kind === "PERCENTAGE" ? percent : null,
      amount_off_paise: kind === "FIXED" ? amountOff : null,
      min_order_paise: minOrder,
      max_discount_paise: maxDiscount,
      gift_product_id: kind === "FREE_GIFT" ? gift : null,
      applicable_product_ids: formIds(form, "product_ids"),
      applicable_category_ids: formIds(form, "category_ids"),
      filter_eggless: formBool(form, "filter_eggless"),
      filter_vegetarian: formBool(form, "filter_vegetarian"),
      filter_bestseller: formBool(form, "filter_bestseller"),
      filter_new_arrival: formBool(form, "filter_new_arrival"),
      banner_text: formString(form, "banner_text") || null,
      show_banner: formBool(form, "show_banner"),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: formBool(form, "is_active"),
      usage_limit: usage && usage > 0 ? usage : null,
    });
    if (error) return { error: error.message };
    revalidatePath("/admin/offers");
    revalidatePath("/shop");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save offer" };
  }
}

export async function setOfferActive(form: FormData): Promise<void> {
  await requireStaff(CATALOG_WRITE_ROLES);
  const supabase = await staffDb();
  const id = formString(form, "id");
  const isActive = formString(form, "is_active") === "true";
  await supabase.from("offers").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/offers");
  revalidatePath("/shop");
}

export type CouponPreview = {
  error?: string;
  code?: string;
  name?: string;
  message?: string;
  discountPaise?: number;
  giftProductId?: string | null;
  giftName?: string | null;
  kind?: string;
};

export async function previewCoupon(code: string, lines: { productId: string; quantity: number; unitPaise: number }[]): Promise<CouponPreview> {
  const offer = await getOfferByCode(code);
  if (!offer) return { error: "That code is not live" };
  if (offerLifecycle(offer) !== "live") return { error: "That offer is not running right now" };
  const supabase = createPublicSupabaseClient();
  const ids = [...new Set(lines.map((l) => l.productId))];
  const flags = new Map<
    string,
    { categoryId: string | null; isEggless: boolean; isVegetarian: boolean; isBestseller: boolean; isNewArrival: boolean }
  >();
  if (supabase && ids.length) {
    const { data } = await supabase
      .from("products")
      .select("id, primary_category_id, is_eggless, is_vegetarian, is_bestseller, is_new_arrival")
      .in("id", ids);
    for (const row of data ?? []) {
      flags.set(row.id, {
        categoryId: row.primary_category_id,
        isEggless: Boolean(row.is_eggless),
        isVegetarian: Boolean(row.is_vegetarian),
        isBestseller: Boolean(row.is_bestseller),
        isNewArrival: Boolean(row.is_new_arrival),
      });
    }
  }
  const quoted = quoteOffer(
    offer,
    lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPaise: line.unitPaise,
      ...flags.get(line.productId),
    })),
  );
  if ("error" in quoted) return { error: quoted.error };
  let giftName: string | null = null;
  if (quoted.giftProductId && supabase) {
    const { data } = await supabase.from("products").select("name").eq("id", quoted.giftProductId).maybeSingle();
    giftName = data?.name ?? null;
  }
  return {
    code: offer.coupon_code ?? code.trim().toUpperCase(),
    name: offer.name,
    message: quoted.message,
    discountPaise: quoted.discountPaise,
    giftProductId: quoted.giftProductId,
    giftName,
    kind: offer.kind,
  };
}
