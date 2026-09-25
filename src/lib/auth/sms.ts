import { Webhook } from "standardwebhooks";

export function indianMobileFromE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return null;
}

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

function hookSecretForVerifier(): string | null {
  const raw = stripQuotes(process.env.SEND_SMS_HOOK_SECRET ?? "");
  if (!raw) return null;
  // Dashboard copies "v1,whsec_…". GoTrue signs with the part after "v1,".
  return raw.replace(/^v1,/, "");
}

export function verifySendSmsPayload(
  payload: string,
  headers: Headers,
): { user?: { phone?: string }; sms?: { otp?: string } } {
  const secret = hookSecretForVerifier();
  if (!secret) {
    throw new Error("SEND_SMS_HOOK_SECRET is not set on the server. Add it in Vercel and redeploy.");
  }
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signature = headers.get("webhook-signature");
  if (!id || !timestamp || !signature) {
    throw new Error("SMS hook request is missing webhook signature headers.");
  }
  const wh = new Webhook(secret);
  return wh.verify(payload, {
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": signature,
  }) as { user?: { phone?: string }; sms?: { otp?: string } };
}

export async function sendOtpSms(phoneE164: string, otp: string): Promise<void> {
  const mobile = indianMobileFromE164(phoneE164);
  if (!mobile) {
    throw new Error("Only Indian mobile numbers are supported for OTP");
  }
  const key = stripQuotes(process.env.TWO_FACTOR_API_KEY ?? "");
  if (!key) {
    throw new Error("TWO_FACTOR_API_KEY is not set on the server. Add it in Vercel and redeploy.");
  }
  const template = stripQuotes(process.env.TWO_FACTOR_TEMPLATE ?? "") || "two";
  const urls = [
    `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/${mobile}/${encodeURIComponent(otp)}/${encodeURIComponent(template)}`,
    `https://2factor.in/API/V1/${encodeURIComponent(key)}/SMS/91${mobile}/${encodeURIComponent(otp)}/${encodeURIComponent(template)}`,
  ];
  let last = "2Factor did not send the SMS";
  for (const path of urls) {
    const response = await fetch(path);
    const body = (await response.json().catch(() => null)) as { Status?: string; Details?: string } | null;
    if (response.ok && body?.Status === "Success") return;
    last = body?.Details || last;
  }
  const v4 = await fetch("https://2factor.in/API/V1/OTP/SEND", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": key },
    body: JSON.stringify({
      to: `+91${mobile}`,
      channel: "SMS",
      template_name: template,
      var1: otp,
    }),
  });
  const v4Body = (await v4.json().catch(() => null)) as { status?: string; Details?: string; message?: string } | null;
  if (v4.ok && (v4Body?.status === "sent" || v4Body?.status === "Success")) return;
  throw new Error(v4Body?.Details || v4Body?.message || last);
}
