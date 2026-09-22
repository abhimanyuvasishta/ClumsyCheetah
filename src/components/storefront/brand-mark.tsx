import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { px: 40, className: "size-10" },
  md: { px: 52, className: "size-12 md:size-[3.25rem]" },
  lg: { px: 88, className: "size-20 md:size-[5.5rem]" },
} as const;

type BrandMarkProps = {
  className?: string;
  size?: keyof typeof sizes;
  /** Dark footer / navy surfaces */
  onDark?: boolean;
  /** Crest only, no wordmark — use when the seal is large enough to read */
  markOnly?: boolean;
};

export function BrandMark({ className, size = "md", onDark = false, markOnly = false }: BrandMarkProps) {
  const seal = sizes[size];

  return (
    <Link
      href="/"
      className={cn("group inline-flex min-w-0 items-center gap-3", className)}
      aria-label="Clumsy Cheetah Bakes home"
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-cream ring-2",
          onDark ? "ring-sky/70" : "ring-sky/45",
          seal.className,
        )}
      >
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          className="object-contain"
          sizes={`${seal.px}px`}
          priority={size !== "lg"}
        />
      </span>
      {markOnly ? null : (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-heading tracking-[-0.03em]",
              onDark ? "text-cream" : "text-foreground",
              size === "sm" && "text-[1.05rem]",
              size === "md" && "text-[1.2rem] sm:text-[1.35rem]",
              size === "lg" && "text-2xl",
            )}
          >
            Clumsy Cheetah
          </span>
          <span
            className={cn(
              "mt-1 text-[0.62rem] font-medium uppercase tracking-[0.28em]",
              onDark ? "text-sky" : "text-sky-deep",
            )}
          >
            Bakes
          </span>
        </span>
      )}
    </Link>
  );
}
