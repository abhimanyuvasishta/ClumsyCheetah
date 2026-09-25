import { createHmac, timingSafeEqual } from "crypto";

export function indianMobileFromE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return null;
}

function hookSecretBytes(): Buffer | null {
  const raw = process.env.SEND_SMS_HOOK_SECRET?.trim();
  if (!raw) return null;
  const withoutPrefix = raw.replace(/^v1,/, "").replace(/^whsec_/, "");
  try {
    return Buffer.from(withoutPrefix, "base64");
  } catch {
    return null;
  }
}

/** Standard Webhooks (Supabase Auth Hooks). */
export function verifySendSmsSignature(payload: string, headers: Headers): boolean {
  const secret = hookSecretBytes();
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!secret || !id || !timestamp || !signatureHeader) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const signed = `${id}.${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("base64");
  const candidates = signatureHeader.split(" ").flatMap((part) => {
    const value = part.startsWith("v1,") ? part.slice(3) : part;
    return value ? [value] : [];
  });
  return candidates.some((sig) => {
    try {
      const got = Buffer.from(sig, "base64");
      const want = Buffer.from(expected, "base64");
      return got.length === want.length && timingSafeEqual(got, want);
    } catch {
      return false;
    }
  });
}

export async function sendOtpSms(phoneE164: string, otp: string): Promise<void> {
  const mobile = indianMobileFromE164(phoneE164);
  if (!mobile) {
    throw new Error("Only Indian mobile numbers are supported for OTP");
  }
  const key = process.env.TWO_FACTOR_API_KEY?.trim();
  if (!key) {
    throw new Error("TWO_FACTOR_API_KEY is not set");
  }
  const template = process.env.TWO_FACTOR_TEMPLATE?.trim();
  const path = template
    ? `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/${mobile}/${encodeURIComponent(otp)}/${encodeURIComponent(template)}`
    : `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/${mobile}/${encodeURIComponent(otp)}`;
  const response = await fetch(path);
  const body = (await response.json().catch(() => null)) as { Status?: string; Details?: string } | null;
  if (!response.ok || body?.Status !== "Success") {
    throw new Error(body?.Details || "2Factor did not send the SMS");
  }
}
