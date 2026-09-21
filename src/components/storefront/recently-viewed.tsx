"use client";

import { useEffect } from "react";

const KEY = "cc-recent-products";

export function rememberProduct(slug: string) {
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    localStorage.setItem(KEY, JSON.stringify([slug, ...prev.filter((s) => s !== slug)].slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function readRecentSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function TrackRecentlyViewed({ slug }: { slug: string }) {
  useEffect(() => {
    rememberProduct(slug);
  }, [slug]);
  return null;
}
