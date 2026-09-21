import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type LoginState = { error?: string; success?: boolean };

export async function signInWithPassword(email: string, password: string): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
