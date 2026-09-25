"use client";

import { cn } from "@/lib/utils";
import { formatInr } from "@/lib/money";
import { displayPaise, useGstMode } from "@/components/storefront/shop-commerce";

type PriceProps = {
  paise: number;
  compareAtPaise?: number | null;
  className?: string;
};

export function Price({ paise, compareAtPaise, className }: PriceProps) {
  const { mode } = useGstMode();
  const show = displayPaise(paise, mode);
  const showCompare = compareAtPaise && compareAtPaise > paise ? displayPaise(compareAtPaise, mode) : null;
  return (
    <span className={cn("inline-flex flex-col items-start gap-0.5", className)}>
      <span className="inline-flex items-baseline gap-2">
        <span className="font-medium tracking-tight">{formatInr(show)}</span>
        {showCompare ? <span className="text-sm text-muted-foreground line-through">{formatInr(showCompare)}</span> : null}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {mode === "incl" ? "incl. 5% GST" : "excl. 5% GST"}
      </span>
    </span>
  );
}

export function GstToggle({ className }: { className?: string }) {
  const { mode, setMode } = useGstMode();
  return (
    <div className={cn("inline-flex rounded-full border p-0.5 text-xs", className)}>
      <button
        type="button"
        onClick={() => setMode("incl")}
        className={cn("rounded-full px-3 py-1", mode === "incl" ? "bg-primary text-primary-foreground" : "")}
      >
        With GST
      </button>
      <button
        type="button"
        onClick={() => setMode("excl")}
        className={cn("rounded-full px-3 py-1", mode === "excl" ? "bg-primary text-primary-foreground" : "")}
      >
        Without GST
      </button>
    </div>
  );
}
