import { cn } from "@/lib/utils";

const styles = {
  BESTSELLER: "bg-primary text-primary-foreground",
  NEW: "bg-gold text-espresso",
  LIMITED: "bg-blush text-espresso",
  EGGLESS: "bg-surface/90 text-espresso",
} as const;

export type ProductBadgeKind = keyof typeof styles;

export function ProductBadge({ kind, className }: { kind: ProductBadgeKind; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] uppercase",
        styles[kind],
        className,
      )}
    >
      {kind === "BESTSELLER" ? "Bestseller" : kind.charAt(0) + kind.slice(1).toLowerCase()}
    </span>
  );
}
