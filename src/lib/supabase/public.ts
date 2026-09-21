import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";

/** Anon client with no cookies — safe at build time (`generateStaticParams`). */
export function createPublicSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
