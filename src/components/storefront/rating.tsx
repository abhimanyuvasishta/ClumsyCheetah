import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value = 4.8,
  count,
  className,
}: {
  value?: number;
  count?: number;
  className?: string;
}) {
  return (
    <p className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <Star className="size-3.5 fill-gold text-gold" aria-hidden />
      <span className="tabular-nums text-foreground">{value.toFixed(1)}</span>
      {count != null ? <span>({count})</span> : null}
      <span className="sr-only">out of 5</span>
    </p>
  );
}
