import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { toE164Phone } from "@/lib/auth/phone";

export type LoginState = { error?: string; success?: boolean; needsEmailConfirm?: boolean };

function authRedirect(next = "/account") {
  const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return origin ? `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}` : undefined;
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

export async function signInWithGoogle(next = "/account"): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authRedirect(next),
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function requestPhoneOtp(phone: string): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }
  const e164 = toE164Phone(phone);
  if (!e164) {
    return { error: "Enter a 10-digit Indian mobile number" };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  const { error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { shouldCreateUser: true },
  });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<LoginState> {
  const e164 = toE164Phone(phone);
  if (!e164) {
    return { error: "Enter a 10-digit Indian mobile number" };
  }
  const code = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from SMS" };
  }
  const supabase = createBrowserSupabaseClient();
  if (!supabase) {
    return { error: "Could not start a Supabase client." };
  }
  const { error } = await supabase.auth.verifyOtp({
    phone: e164,
    token: code,
    type: "sms",
  });
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

