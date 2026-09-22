import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = supabase
    ? await supabase.from("profiles").select("full_name, phone").eq("id", user.userId).maybeSingle()
    : { data: null };

  return (
    <section className="rounded-[1.15rem] border bg-surface p-6">
      <p className="text-sm text-muted-foreground">Profile</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Name</dt>
          <dd>{profile?.full_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd>{user.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Phone</dt>
          <dd>{profile?.phone || "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
