import { getStaffSession, hasAnyRole, type StaffSession } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { StaffRole } from "@/types/roles";

export async function requireStaff(allowed?: StaffRole[]): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("Staff session required");
  }
  if (allowed && !hasAnyRole(session, allowed)) {
    throw new Error("This role cannot do that");
  }
  return session;
}

export async function staffDb() {
  await requireStaff();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

export async function privilegedDb(allowed?: StaffRole[]) {
  await requireStaff(allowed);
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
  }
  return supabase;
}
