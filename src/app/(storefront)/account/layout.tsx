import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/storefront/account-nav";
import { SignOutButton } from "@/components/storefront/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const supabase = await createServerSupabaseClient();
  const { data: profile } = supabase
    ? await supabase.from("profiles").select("full_name").eq("id", user.userId).maybeSingle()
    : { data: null };
  const firstName = profile?.full_name?.split(" ")[0] || "you";

  return (
    <div className="store-wrap py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 font-heading text-4xl">Hello, {firstName}.</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
