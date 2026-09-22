import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AddressForm } from "@/components/storefront/address-form";
import { deleteAddress, setDefaultAddress } from "@/app/(storefront)/account/addresses/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Addresses" };
export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createServerSupabaseClient();
  const { data: addresses } = supabase
    ? await supabase
        .from("addresses")
        .select("id, label, full_name, phone, line1, line2, city, state, pincode, is_default")
        .eq("user_id", user.userId)
        .is("deleted_at", null)
        .order("is_default", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.15rem] border bg-surface p-6">
        <h2 className="font-heading text-2xl">Saved addresses</h2>
        {!addresses?.length ? (
          <p className="mt-2 text-muted-foreground">None yet. Add one for delivery.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-xl border p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {a.label || "Address"}
                      {a.is_default ? <span className="ml-2 text-xs text-muted-foreground">Default</span> : null}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {a.full_name}, {a.phone}
                      <br />
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      <br />
                      {a.city}, {a.state} {a.pincode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!a.is_default ? (
                      <form action={setDefaultAddress.bind(null, a.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          Make default
                        </Button>
                      </form>
                    ) : null}
                    <form action={deleteAddress.bind(null, a.id)}>
                      <Button type="submit" variant="destructive" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-[1.15rem] border bg-surface p-6">
        <h2 className="font-heading text-2xl">Add address</h2>
        <AddressForm />
      </section>
    </div>
  );
}
