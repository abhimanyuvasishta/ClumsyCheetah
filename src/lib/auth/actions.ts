import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AUTH_NEXT_COOKIE } from "@/lib/auth/errors";

export type LoginState = { error?: string; success?: boolean; needsEmailConfirm?: boolean; url?: string };

function siteOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export function rememberAuthNext(next: string) {
  if (typeof document === "undefined") return;
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=600; SameSite=Lax`;
}

export async function signInWithGoogle(next = "/account"): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  rememberAuthNext(next);
  const origin = siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: origin ? `${origin}/auth/callback` : undefined,
      skipBrowserRedirect: true,
    },
  });
  if (error) {
    return { error: error.message };
  }
  if (!data.url) {
    return { error: "Google did not return a sign-in URL." };
  }
  return { success: true, url: data.url };
}

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

