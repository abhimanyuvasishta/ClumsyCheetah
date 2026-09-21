"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KEY = "cc-wishlist-v1";

function readIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setOn(readIds().includes(productId)));
    return () => window.cancelAnimationFrame(id);
  }, [productId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ids = new Set(readIds());
    if (ids.has(productId)) ids.delete(productId);
    else ids.add(productId);
    localStorage.setItem(KEY, JSON.stringify([...ids]));
    setOn(ids.has(productId));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-surface/90 text-foreground transition hover:bg-surface",
        className,
      )}
    >
      <Heart className={cn("size-4", on && "fill-blush text-blush")} />
    </button>
  );
}
