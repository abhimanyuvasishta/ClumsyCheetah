"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/app/admin/products/actions";
import { paiseToRupeesInput } from "@/lib/money";
import type { AdminProductDetail } from "@/lib/admin/catalog";

const field = "mt-1";

export function ProductForm({
  action,
  product,
  categories,
  submitLabel,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  product?: AdminProductDetail | null;
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const first = product?.product_variants?.[0];

  return (
    <form action={formAction} className="grid max-w-3xl gap-4">
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={product?.name} className={field} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto from name" className={field} />
        </div>
        <div>
          <Label htmlFor="sku">Base SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} className={field} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? "DRAFT"}
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active (on shop)</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <Label htmlFor="primary_category_id">Category</Label>
          <select
            id="primary_category_id"
            name="primary_category_id"
            defaultValue={product?.primary_category_id ?? ""}
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="thumbnail_url">Image URL</Label>
          <Input id="thumbnail_url" name="thumbnail_url" defaultValue={product?.thumbnail_url ?? ""} className={field} />
        </div>
      </div>
      <div>
        <Label htmlFor="short_description">Short description</Label>
        <Input id="short_description" name="short_description" defaultValue={product?.short_description ?? ""} className={field} />
      </div>
      <div>
        <Label htmlFor="long_description">Long description</Label>
        <textarea
          id="long_description"
          name="long_description"
          defaultValue={product?.long_description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      {!product ? (
        <div className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-3">
          <p className="sm:col-span-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">First variant (price is rupees, stored as paise)</p>
          <div>
            <Label htmlFor="variant_sku">Variant SKU</Label>
            <Input id="variant_sku" name="variant_sku" className={field} />
          </div>
          <div>
            <Label htmlFor="variant_name">Size / name</Label>
            <Input id="variant_name" name="variant_name" placeholder="500 g" className={field} />
          </div>
          <div>
            <Label htmlFor="price_rupees">Price ₹</Label>
            <Input id="price_rupees" name="price_rupees" type="number" min="0" step="0.01" required defaultValue="0" className={field} />
          </div>
          <div>
            <Label htmlFor="compare_rupees">Compare-at ₹</Label>
            <Input id="compare_rupees" name="compare_rupees" type="number" min="0" step="0.01" className={field} />
          </div>
        </div>
      ) : (
        <input type="hidden" name="price_rupees" value={first ? paiseToRupeesInput(first.price_paise) : "0"} />
      )}
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_bestseller" defaultChecked={product?.is_bestseller} /> Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_new_arrival" defaultChecked={product?.is_new_arrival} /> New
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_vegetarian" defaultChecked={product?.is_vegetarian ?? true} /> Veg
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_eggless" defaultChecked={product?.is_eggless ?? true} /> Eggless
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="contains_egg" defaultChecked={product?.contains_egg} /> Contains egg
        </label>
      </div>
      {product ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="allergen_info">Allergens</Label>
            <Input id="allergen_info" name="allergen_info" defaultValue={product.allergen_info ?? ""} className={field} />
          </div>
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Input id="ingredients" name="ingredients" defaultValue={product.ingredients ?? ""} className={field} />
          </div>
          <div>
            <Label htmlFor="seo_title">SEO title</Label>
            <Input id="seo_title" name="seo_title" defaultValue={product.seo_title ?? ""} className={field} />
          </div>
          <div>
            <Label htmlFor="seo_description">SEO description</Label>
            <Input id="seo_description" name="seo_description" defaultValue={product.seo_description ?? ""} className={field} />
          </div>
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
