"use server";

import { sendTwoFactorAutogen, verifyTwoFactorAndSession } from "@/lib/auth/phone-otp";

export type PhoneOtpState = {
  error?: string;
  success?: boolean;
  sessionId?: string;
  accessToken?: string;
  refreshToken?: string;
};

export async function requestPhoneOtp(phone: string): Promise<PhoneOtpState> {
  const result = await sendTwoFactorAutogen(phone);
  if ("error" in result) return { error: result.error };
  return { success: true, sessionId: result.sessionId };
}

export async function verifyPhoneOtp(phone: string, sessionId: string, token: string): Promise<PhoneOtpState> {
  const result = await verifyTwoFactorAndSession(phone, sessionId, token);
  if ("error" in result) return { error: result.error };
  return { success: true, accessToken: result.accessToken, refreshToken: result.refreshToken };
}
