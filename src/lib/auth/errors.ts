export function authErrorMessage(raw: string | null | undefined, source: "google" | "any" = "any"): string {
  if (!raw) {
    return "Google sign-in did not finish. Try again.";
  }
  const text = decodeURIComponent(raw.replace(/\+/g, " "));
  if (/provider is not enabled/i.test(text)) {
    return "Google is not turned on yet. In Supabase go to Authentication → Providers → Google, enable it, and paste the Client ID and Secret.";
  }
  if (/redirect/i.test(text)) {
    return "Add https://www.clumsycheetah.in/auth/callback to Supabase Authentication → URL configuration → Redirect URLs.";
  }
  if (/code verifier|both auth code/i.test(text)) {
    return "Google sign-in expired. Tap Continue with Google again.";
  }
  if (/database error saving new user/i.test(text)) {
    return "Signed in, but creating the shop profile failed. Check the handle_new_user trigger in Supabase.";
  }
  return text;
}

export const AUTH_NEXT_COOKIE = "cc-auth-next";
