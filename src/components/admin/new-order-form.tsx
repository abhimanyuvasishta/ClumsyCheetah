"use client";

import { useActionState } from "react";
import { createManualOrder, type OrderActionState } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/lib/money";

export function NewOrderForm({
  variants,
}: {
  variants: { id: string; sku: string; name: string; price_paise: number; productName: string }[];
}) {
  const [state, action, pending] = useActionState(createManualOrder, {} as OrderActionState);
  return (
    <form action={action} className="grid max-w-xl gap-4">
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Label htmlFor="contact_name">Customer name</Label>
        <Input id="contact_name" name="contact_name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="contact_phone">Phone</Label>
        <Input id="contact_phone" name="contact_phone" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="contact_email">Email</Label>
        <Input id="contact_email" name="contact_email" type="email" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="variant_id">Item (price from catalog, not typed)</Label>
        <select id="variant_id" name="variant_id" required className="mt-1 h-8 w-full rounded-lg border px-2 text-sm">
          <option value="">Choose variant</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.productName} — {v.name} ({v.sku}) {formatInr(v.price_paise)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="quantity">Qty</Label>
        <Input id="quantity" name="quantity" type="number" min={1} step={1} defaultValue={1} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="staff_notes">Kitchen note</Label>
        <Input id="staff_notes" name="staff_notes" className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create order"}
      </Button>
    </form>
  );
}
