import { randomInt } from "node:crypto";
import { indianMobileFromE164 } from "@/lib/auth/sms";
import { toE164Phone } from "@/lib/auth/phone";
import { createServiceRoleClient } from "@/lib/supabase/service";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function twoFactorKey(): string {
  const key = stripQuotes(process.env.TWO_FACTOR_API_KEY ?? "");
  if (!key) throw new Error("TWO_FACTOR_API_KEY is not set on Vercel. Add it and Redeploy.");
  return key;
}

function templateNames(): string[] {
  const env = stripQuotes(process.env.TWO_FACTOR_TEMPLATE ?? "");
  // Template "one" + AUTOGEN was delivering a voice call. Prefer "two".
  const names = env && env !== "one" ? [env, "two", "one"] : ["two", "one"];
  return [...new Set(names)];
}

function generateOtp(): string {
  return String(randomInt(100000, 1_000_000));
}

type FactorJson = {
  Status?: string;
  Details?: string;
  status?: string;
  message?: string;
  session_id?: string;
  sessionId?: string;
};

function sessionIdFrom(body: FactorJson): string | null {
  const candidates = [body.session_id, body.sessionId, body.Details];
  for (const value of candidates) {
    if (typeof value === "string" && /[a-zA-Z0-9-]{8,}/.test(value) && !/otp matched|invalid|error/i.test(value)) {
      return value;
    }
  }
  return null;
}

async function factorGet(path: string): Promise<FactorJson> {
  const response = await fetch(path);
  return ((await response.json().catch(() => null)) ?? {}) as FactorJson;
}

/** Custom OTP + named SMS template. AUTOGEN on this 2Factor account places a voice call. */
export async function sendTwoFactorAutogen(phoneRaw: string): Promise<{ sessionId: string } | { error: string }> {
  const e164 = toE164Phone(phoneRaw);
  const mobile = e164 ? indianMobileFromE164(e164) : null;
  if (!mobile) return { error: "Enter a 10-digit Indian mobile number" };
  let key: string;
  try {
    key = twoFactorKey();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Missing 2Factor key" };
  }
  const otp = generateOtp();
  const encodedKey = encodeURIComponent(key);
  const encodedOtp = encodeURIComponent(otp);
  let last = "2Factor could not send SMS with template “two”.";
  for (const template of templateNames()) {
    const encodedTemplate = encodeURIComponent(template);
    const urls = [
      `https://2factor.in/API/V1/${encodedKey}/SMS/+91${mobile}/${encodedOtp}/${encodedTemplate}`,
      `https://2factor.in/API/V1/${encodedKey}/SMS/${mobile}/${encodedOtp}/${encodedTemplate}`,
    ];
    for (const url of urls) {
      const body = await factorGet(url);
      const sessionId = body.Status === "Success" ? sessionIdFrom(body) : null;
      if (sessionId) return { sessionId };
      last = body.Details || body.message || last;
    }

    const v4 = await fetch("https://2factor.in/API/V1/OTP/SEND", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": key },
      body: JSON.stringify({
        to: `+91${mobile}`,
        channel: "sms",
        template: template,
        template_name: template,
        var1: otp,
        otp,
      }),
    });
    const v4Body = ((await v4.json().catch(() => null)) ?? {}) as FactorJson;
    const v4Session = sessionIdFrom(v4Body);
    if (v4Session && (v4.ok || v4Body.Status === "Success" || v4Body.status === "sent" || v4Body.status === "Success")) {
      return { sessionId: v4Session };
    }
    last = v4Body.Details || v4Body.message || last;
  }
  return { error: last };
}

export async function verifyTwoFactorAndSession(
  phoneRaw: string,
  sessionId: string,
  token: string,
): Promise<{ accessToken: string; refreshToken: string } | { error: string }> {
  const e164 = toE164Phone(phoneRaw);
  const mobile = e164 ? indianMobileFromE164(e164) : null;
  if (!mobile || !e164) return { error: "Enter a 10-digit Indian mobile number" };
  const code = token.replace(/\s/g, "");
  if (!/^\d{4,8}$/.test(code)) return { error: "Enter the code from the SMS" };
  if (!sessionId) return { error: "Send a new SMS code first" };

  let key: string;
  try {
    key = twoFactorKey();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Missing 2Factor key" };
  }

  const verified = await factorGet(
    `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(code)}`,
  );
  if (verified.Status !== "Success") {
    return { error: verified.Details || verified.message || "That code is not right. Try again." };
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is missing on Vercel, so we cannot open a shop session after SMS." };
  }

  const email = `otp.${mobile}@phone.clumsycheetah.in`;
  const { data: profile } = await admin.from("profiles").select("id").eq("phone", e164).maybeSingle();
  let userId = profile?.id as string | undefined;

  if (!userId) {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      phone: e164,
      phone_confirm: true,
    });
    if (created.data.user) {
      userId = created.data.user.id;
    } else {
      const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
      const existing = listed.data.users.find((u) => u.phone === e164 || u.email === email);
      userId = existing?.id;
      if (!userId) {
        return { error: created.error?.message ?? "Could not create the shop account" };
      }
    }
  }

  await admin.from("profiles").update({ phone: e164 }).eq("id", userId);
  const user = await admin.auth.admin.getUserById(userId);
  const loginEmail = user.data.user?.email || email;
  if (!user.data.user?.email) {
    await admin.auth.admin.updateUserById(userId, { email, email_confirm: true });
  }

  const link = await admin.auth.admin.generateLink({ type: "magiclink", email: loginEmail });
  const hashed = link.data.properties?.hashed_token;
  if (link.error || !hashed) {
    return { error: link.error?.message ?? "Could not open a shop session" };
  }

  const session = await admin.auth.verifyOtp({ type: "email", token_hash: hashed });
  const access = session.data.session?.access_token;
  const refresh = session.data.session?.refresh_token;
  if (session.error || !access || !refresh) {
    return { error: session.error?.message ?? "Could not open a shop session" };
  }
  return { accessToken: access, refreshToken: refresh };
}
