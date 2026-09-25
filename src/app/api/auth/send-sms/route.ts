import { NextResponse } from "next/server";
import { sendOtpSms, verifySendSmsSignature } from "@/lib/auth/sms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  if (!verifySendSmsSignature(payload, request.headers)) {
    return NextResponse.json(
      { error: { http_code: 401, message: "Invalid SMS hook signature" } },
      { status: 401 },
    );
  }

  let parsed: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    parsed = JSON.parse(payload) as { user?: { phone?: string }; sms?: { otp?: string } };
  } catch {
    return NextResponse.json({ error: { http_code: 400, message: "Invalid payload" } }, { status: 400 });
  }

  const phone = parsed.user?.phone;
  const otp = parsed.sms?.otp;
  if (!phone || !otp) {
    return NextResponse.json({ error: { http_code: 400, message: "Missing phone or OTP" } }, { status: 400 });
  }

  try {
    await sendOtpSms(phone, otp);
    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send SMS";
    return NextResponse.json({ error: { http_code: 500, message } }, { status: 500 });
  }
}
