import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }
  const supabase = await createServerSupabaseClient();

  let account = {
    email: user.email ?? "",
    name: "",
    phone: "",
  };
  let savedAddresses: {
    id: string;
    label: string | null;
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
  }[] = [];

  if (supabase) {
    const [{ data: profile }, { data: addresses }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("id", user.userId).maybeSingle(),
      supabase
        .from("addresses")
        .select("id, label, full_name, phone, line1, line2, landmark, city, state, pincode, is_default")
        .eq("user_id", user.userId)
        .is("deleted_at", null)
        .order("is_default", { ascending: false }),
    ]);
    account = {
      email: user.email ?? "",
      name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    };
    savedAddresses = addresses ?? [];
  }

  return <CheckoutForm account={account} savedAddresses={savedAddresses} />;
}
