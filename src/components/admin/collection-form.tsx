"use client";

import { useActionState } from "react";
import { saveCollection, type CollectionState } from "@/app/admin/collections/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CollectionForm({
  collection,
  products,
}: {
  collection?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
    productIds: string[];
    bannerHeading?: string;
    bannerBody?: string;
  };
  products: { id: string; name: string }[];
}) {
  const action = saveCollection.bind(null, collection?.id ?? null);
  const [state, formAction, pending] = useActionState(action, {} as CollectionState);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4">
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={collection?.name} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={collection?.slug} placeholder="auto from name" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort order</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={collection?.sort_order ?? 0} className="mt-1" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={collection?.is_active ?? true} /> Show on website
        </label>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" defaultValue={collection?.description ?? ""} rows={3} className="mt-1 w-full rounded-lg border px-2.5 py-2 text-sm" />
      </div>
      <div>
        <Label htmlFor="banner_heading">Page heading</Label>
        <Input id="banner_heading" name="banner_heading" defaultValue={collection?.bannerHeading ?? collection?.name} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="banner_body">Page intro</Label>
        <textarea id="banner_body" name="banner_body" defaultValue={collection?.bannerBody ?? ""} rows={2} className="mt-1 w-full rounded-lg border px-2.5 py-2 text-sm" />
      </div>
      <div>
        <Label htmlFor="image">Hero image</Label>
        {collection?.image_url ? <img src={collection.image_url} alt="" className="mt-1 h-24 w-40 rounded-lg object-cover" /> : null}
        <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="mt-1" />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Products in this collection</legend>
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg border p-3">
          {products.map((product) => (
            <label key={product.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="product_id" value={product.id} defaultChecked={collection?.productIds.includes(product.id)} />
              {product.name}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save collection"}
      </Button>
    </form>
  );
}
