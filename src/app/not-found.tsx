import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="mt-3 font-heading text-5xl">This tray is empty.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">That URL isn’t on the menu. The bakers have not hidden a secret cake here.</p>
      <Link href="/" className={cn(buttonVariants(), "mt-8 rounded-full")}>
        Back to the bakery
      </Link>
    </div>
  );
}
