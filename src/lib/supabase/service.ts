import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

/** Server-only. Never import from client components. */
export function createServiceRoleClient() {
  const config = getSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config || !key) {
    return null;
  }
  return createClient(config.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
