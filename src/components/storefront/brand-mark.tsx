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
  /** Dark footer / espresso surfaces */
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
          "relative shrink-0 overflow-hidden rounded-full bg-[oklch(0.975_0.014_82)] ring-1",
          onDark ? "ring-[oklch(0.78_0.09_78_/_0.45)]" : "ring-[oklch(0.32_0.045_48_/_0.12)]",
          seal.className,
        )}
      >
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          className="object-cover"
          sizes={`${seal.px}px`}
          priority={size !== "lg"}
        />
      </span>
      {markOnly ? null : (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-heading tracking-[-0.03em]",
              onDark ? "text-[oklch(0.97_0.01_85)]" : "text-foreground",
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
              onDark ? "text-[oklch(0.82_0.06_75)]" : "text-caramel",
            )}
          >
            Bakes
          </span>
        </span>
      )}
    </Link>
  );
}
