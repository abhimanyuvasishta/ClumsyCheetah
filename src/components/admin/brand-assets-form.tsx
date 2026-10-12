"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearBrandAsset, uploadBrandAsset, type BrandState } from "@/app/admin/appearance/brand-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandAssets } from "@/lib/storefront/config";

function Slot({
  kind,
  label,
  url,
}: {
  kind: "logo" | "icon" | "favicon";
  label: string;
  url: string;
}) {
  const [state, action, pending] = useActionState(uploadBrandAsset, {} as BrandState);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm font-medium">{label}</p>
      <img src={url} alt="" className="mt-3 h-16 w-16 rounded-full object-contain ring-1 ring-border" />
      <form action={action} className="mt-3 space-y-2">
        <input type="hidden" name="kind" value={kind} />
        <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" required className="block text-sm" />
        <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "sm" }))}>
          {pending ? "Uploading…" : "Replace"}
        </button>
      </form>
      <button
        type="button"
        className="mt-2 text-xs underline"
        onClick={() => {
          void clearBrandAsset(kind).then(() => router.refresh());
        }}
      >
        Use default logo
      </button>
      {state.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="mt-2 text-xs text-emerald-700">Saved.</p> : null}
    </div>
  );
}

export function BrandAssetsForm({ brand }: { brand: BrandAssets }) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <Slot kind="logo" label="Logo (header, footer, checkout)" url={brand.logoUrl} />
      <Slot kind="icon" label="App icon (home screen / Apple)" url={brand.iconUrl} />
      <Slot kind="favicon" label="Favicon (browser tab)" url={brand.faviconUrl} />
    </section>
  );
}
