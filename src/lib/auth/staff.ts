import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isStaffRole, type AppRole, type StaffRole } from "@/types/roles";

export type AuthUser = {
  userId: string;
  email: string | null;
};

export type StaffSession = AuthUser & { roles: StaffRole[] };

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { userId: user.id, email: user.email ?? null };
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const user = await getAuthUser();
  if (!user) return null;

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.userId)
    .is("revoked_at", null);
  const roles = (roleRows ?? []).map((row) => row.role as AppRole).filter(isStaffRole);
  if (!roles.length) return null;
  return { ...user, roles };
}

export function hasAnyRole(session: StaffSession, allowed: StaffRole[]): boolean {
  return session.roles.some((role) => allowed.includes(role));
}
