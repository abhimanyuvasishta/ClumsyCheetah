"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { GstToggle } from "@/components/storefront/price";

const sorts = [
  { value: "popular", label: "Recommended" },
  { value: "bestselling", label: "Best selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

export function ShopFilters({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`/shop?${next.toString()}`);
  }

  const filters = (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => update("category", params.get("category") === c.slug ? null : c.slug)}
              className={`rounded-full border px-3 py-1.5 text-sm ${params.get("category") === c.slug ? "border-primary bg-primary text-primary-foreground" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ["eggless", "Eggless"],
          ["veg", "Vegetarian"],
          ["bestseller", "Best seller"],
          ["new", "New"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => update(key, params.get(key) === "1" ? null : "1")}
            className={`rounded-full border px-3 py-1.5 text-sm ${params.get(key) === "1" ? "border-primary bg-primary text-primary-foreground" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-4">
      <div className="hidden flex-1 md:block">{filters}</div>
      <Sheet>
        <SheetTrigger className="inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm md:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] bg-background">
          <SheetHeader>
            <SheetTitle>Filter the case</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-8">{filters}</div>
        </SheetContent>
      </Sheet>
      <GstToggle />
      <label className="flex items-center gap-2 text-sm">
        Sort
        <select
          className="h-10 rounded-full border bg-background px-3"
          value={params.get("sort") ?? "popular"}
          onChange={(e) => update("sort", e.target.value)}
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
