import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  STOREFRONT_SETTINGS_KEY,
  defaultStorefrontConfig,
  mergeStorefrontConfig,
  type StorefrontConfig,
} from "@/lib/storefront/config";

export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  if (!isSupabaseConfigured()) return defaultStorefrontConfig;
  const supabase = createPublicSupabaseClient();
  if (!supabase) return defaultStorefrontConfig;
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", STOREFRONT_SETTINGS_KEY)
    .maybeSingle();
  if (error || !data?.value) return defaultStorefrontConfig;
  return mergeStorefrontConfig(data.value);
}
