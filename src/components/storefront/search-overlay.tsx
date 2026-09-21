"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { homepageContent } from "@/data/homepage";
import type { CatalogProduct } from "@/types/catalog";

const RECENT_KEY = "cc-recent-searches";

export function SearchOverlay({ products }: { products: CatalogProduct[] }) {
  const { searchOpen, setSearchOpen } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!searchOpen) return;
    const id = window.requestAnimationFrame(() => {
      try {
        setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]);
      } catch {
        setRecent([]);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter((p) => `${p.name} ${p.tags.join(" ")} ${p.shortDescription ?? ""}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [products, q]);

  function go(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setSearchOpen(false);
    setQ("");
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search">
      <div className="store-wrap pt-6">
        <div className="flex items-center gap-3 rounded-full border bg-surface px-4">
          <Search className="size-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) go(q.trim());
            }}
            placeholder="Search cakes, brownies, hampers…"
            className="h-14 flex-1 bg-transparent text-base outline-none"
          />
          <button type="button" onClick={() => setSearchOpen(false)} className="size-10" aria-label="Close search">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">Popular</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {homepageContent.popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => go(term)}
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-secondary"
                >
                  {term}
                </button>
              ))}
            </div>
            {recent.length ? (
              <>
                <p className="eyebrow mt-8">Recent</p>
                <ul className="mt-3 space-y-2">
                  {recent.map((term) => (
                    <li key={term}>
                      <button type="button" className="text-sm hover:underline" onClick={() => go(term)}>
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <div>
            <p className="eyebrow">{q ? "Suggested" : "Try a name"}</p>
            <ul className="mt-3 space-y-3">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)} className="font-heading text-lg hover:underline">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
