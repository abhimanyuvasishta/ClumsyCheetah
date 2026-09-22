"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addVariant, updateVariant, type ActionState } from "@/app/admin/products/actions";
import { paiseToRupeesInput } from "@/lib/money";
import type { AdminProductDetail } from "@/lib/admin/catalog";

export function VariantEditor({
  productId,
  variants,
}: {
  productId: string;
  variants: NonNullable<AdminProductDetail["product_variants"]>;
}) {
  const add = updateBinder(productId);

  return (
    <div className="space-y-6">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase text-muted-foreground">
            <th className="py-2 pr-2">SKU</th>
            <th className="py-2 pr-2">Name</th>
            <th className="py-2 pr-2">₹</th>
            <th className="py-2 pr-2">Compare ₹</th>
            <th className="py-2 pr-2">Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {variants
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((v) => (
              <VariantRow key={v.id} productId={productId} variant={v} />
            ))}
        </tbody>
      </table>
      <AddVariantForm action={add} />
    </div>
  );
}

function updateBinder(productId: string) {
  return addVariant.bind(null, productId);
}

function VariantRow({
  productId,
  variant,
}: {
  productId: string;
  variant: NonNullable<AdminProductDetail["product_variants"]>[number];
}) {
  const bound = updateVariant.bind(null, productId, variant.id);
  const [state, formAction, pending] = useActionState(bound, {} as ActionState);
  return (
    <tr className="border-b align-top">
      <td colSpan={6} className="py-2">
        <form action={formAction} className="grid grid-cols-6 gap-2">
          <Input name="sku" defaultValue={variant.sku} required />
          <Input name="name" defaultValue={variant.name} required />
          <Input name="price_rupees" type="number" step="0.01" min="0" defaultValue={paiseToRupeesInput(variant.price_paise)} required />
          <Input
            name="compare_rupees"
            type="number"
            step="0.01"
            min="0"
            defaultValue={variant.compare_at_paise ? paiseToRupeesInput(variant.compare_at_paise) : ""}
          />
          <select name="status" defaultValue={variant.status} className="h-8 rounded-lg border border-input px-2 text-sm">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "…" : "Save"}
          </Button>
          {state.error ? <p className="col-span-6 text-xs text-destructive">{state.error}</p> : null}
        </form>
      </td>
    </tr>
  );
}

function AddVariantForm({ action }: { action: (state: ActionState, form: FormData) => Promise<ActionState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-2 rounded-lg border bg-white p-4 sm:grid-cols-6">
      <p className="sm:col-span-6 text-xs font-medium uppercase text-muted-foreground">Add size / flavour</p>
      <Input name="sku" placeholder="SKU" required />
      <Input name="name" placeholder="1 kg" required />
      <Input name="flavour" placeholder="Flavour" />
      <Input name="weight_label" placeholder="Weight label" />
      <Input name="price_rupees" type="number" step="0.01" min="0" placeholder="₹" required />
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add variant"}
      </Button>
      {state.error ? <p className="sm:col-span-6 text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
