"use client";

import { useActionState } from "react";
import { saveAddress, type AddressState } from "@/app/(storefront)/account/addresses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddressForm() {
  const [state, action, pending] = useActionState(saveAddress, {} as AddressState);
  return (
    <form action={action} className="mt-6 grid gap-3 sm:grid-cols-2">
      {state.error ? <p className="sm:col-span-2 text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="sm:col-span-2 text-sm text-muted-foreground">Address saved.</p> : null}
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Home" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="full_name">Name</Label>
        <Input id="full_name" name="full_name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" required className="mt-1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="line1">Address</Label>
        <Input id="line1" name="line1" required className="mt-1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="line2">Apartment / floor</Label>
        <Input id="line2" name="line2" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" required defaultValue="Mumbai" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" required defaultValue="Maharashtra" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="pincode">PIN</Label>
        <Input id="pincode" name="pincode" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="landmark">Landmark</Label>
        <Input id="landmark" name="landmark" className="mt-1" />
      </div>
      <label className="sm:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_default" /> Default delivery address
      </label>
      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}
