import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

/** Anon client with no cookies — safe at build time (`generateStaticParams`). */
export function createPublicSupabaseClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    return null;
  }

  try {
    return createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}
