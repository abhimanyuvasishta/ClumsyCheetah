import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/account";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";
  const origin = url.origin;
  const host = request.headers.get("x-forwarded-host");
  const site =
    process.env.NODE_ENV !== "development" && host ? `https://${host}` : origin;

  if (!code) {
    return NextResponse.redirect(`${site}/login?error=${encodeURIComponent("Google sign-in did not finish")}`);
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    return NextResponse.redirect(`${site}/login?error=${encodeURIComponent("Auth is not configured")}`);
  }

  const redirectTo = NextResponse.redirect(`${site}${next}`);
  const cookieStore = await cookies();
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Route handlers still need cookies on the redirect response.
          }
          redirectTo.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${site}/login?error=${encodeURIComponent(error.message)}`);
  }
  return redirectTo;
}
