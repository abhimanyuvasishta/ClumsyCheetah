export function authErrorMessage(raw: string | null | undefined, source: "google" | "phone" | "any" = "any"): string {
  if (!raw) {
    return source === "phone" ? "Could not send the SMS code. Try again." : "Google sign-in did not finish. Try again.";
  }
  const text = decodeURIComponent(raw.replace(/\+/g, " "));
  if (/provider is not enabled/i.test(text)) {
    if (source === "phone") {
      return "Phone login is not on yet. In Supabase go to Authentication → Providers → Phone, enable it, and connect Twilio (or Textlocal).";
    }
    return "Google is not turned on yet. In Supabase go to Authentication → Providers → Google, enable it, and paste the Client ID and Secret.";
  }
  if (source !== "google" && /error sending|unable to send|sms|twilio|textlocal|messagebird|vonage/i.test(text)) {
    return "SMS did not send. In Supabase, Authentication → Providers → Phone, check the SMS credentials and that India (+91) is allowed.";
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
  if (/token has expired|otp_expired|expired/i.test(text) && source === "phone") {
    return "That code expired. Send a new SMS code.";
  }
  if (/invalid.*token|token.*invalid/i.test(text) && source === "phone") {
    return "That code is not right. Check the 6 digits and try again.";
  }
  return text;
}

export const AUTH_NEXT_COOKIE = "cc-auth-next";
