import { cn } from "@/lib/utils";
import { formatInr } from "@/lib/money";

type PriceProps = {
  paise: number;
  compareAtPaise?: number | null;
  className?: string;
};

export function Price({ paise, compareAtPaise, className }: PriceProps) {
  const showCompare = compareAtPaise && compareAtPaise > paise;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-medium tracking-tight">{formatInr(paise)}</span>
      {showCompare ? (
        <span className="text-sm text-muted-foreground line-through">{formatInr(compareAtPaise)}</span>
      ) : null}
    </span>
  );
}
