import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type LoginState = { error?: string; success?: boolean; needsEmailConfirm?: boolean };

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

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.name.trim(),
        phone: input.phone.trim() || null,
      },
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });
  if (error) {
    return { error: error.message };
  }
  if (data.user && data.session && input.phone.trim()) {
    await supabase
      .from("profiles")
      .update({ phone: input.phone.trim(), full_name: input.name.trim() })
      .eq("id", data.user.id);
  }
  if (data.user && !data.session) {
    return { success: true, needsEmailConfirm: true };
  }
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

