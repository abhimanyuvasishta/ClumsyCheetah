import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value = 4.8, className }: { value?: number; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <Star className="size-3.5 fill-caramel text-caramel" aria-hidden />
      <span className="tabular-nums text-foreground">{value.toFixed(1)}</span>
      <span className="sr-only">out of 5, early guest notes</span>
    </p>
  );
}
