import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center", className)}>
      <h2 className="font-heading text-2xl">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-muted-foreground">{description}</p> : null}
      {action ? (
        <Link href={action.href} className={cn(buttonVariants(), "mt-6")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
