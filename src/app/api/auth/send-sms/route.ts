import { NextResponse } from "next/server";
import { sendOtpSms, verifySendSmsPayload } from "@/lib/auth/sms";

export const runtime = "nodejs";

/** HTTP 200 so Auth can read error.message. Never 401 (Auth shows "Hook requires authorization token"). */
function hookFail(message: string) {
  return NextResponse.json({ error: { http_code: 500, message } }, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.text();
  let parsed: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    parsed = verifySendSmsPayload(payload, request.headers);
  } catch (err) {
    return hookFail(err instanceof Error ? err.message : "Could not verify SMS hook");
  }

  const phone = parsed.user?.phone;
  const otp = parsed.sms?.otp;
  if (!phone || !otp) {
    return hookFail("Missing phone or OTP in SMS hook payload");
  }

  try {
    await sendOtpSms(phone, otp);
    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    return hookFail(err instanceof Error ? err.message : "Failed to send SMS");
  }
}
