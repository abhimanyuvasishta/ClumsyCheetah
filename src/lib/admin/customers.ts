import { privilegedDb } from "@/lib/admin/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminCustomer = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  status: string;
  created_at: string | null;
  roles: string[];
};

export async function listAdminCustomers(): Promise<AdminCustomer[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const { data: roles } = await supabase.from("user_roles").select("user_id, role").is("revoked_at", null);
  const roleMap = new Map<string, string[]>();
  for (const row of roles ?? []) {
    const list = roleMap.get(row.user_id) ?? [];
    list.push(row.role);
    roleMap.set(row.user_id, list);
  }

  let emails = new Map<string, string>();
  try {
    const admin = await privilegedDb();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    emails = new Map((data.users ?? []).map((u) => [u.id, u.email ?? ""]));
  } catch {
    emails = new Map();
  }

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emails.get(p.id) || null,
    full_name: p.full_name,
    phone: p.phone,
    status: p.status,
    created_at: p.created_at,
    roles: roleMap.get(p.id) ?? [],
  }));
}
