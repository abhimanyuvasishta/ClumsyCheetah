"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  src: string;
  alt: string;
  href: string;
};

const INTERVAL_MS = 4500;

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = slides[index] ?? slides[0];

  const go = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (!current) {
    return <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-secondary sm:aspect-[5/6]" />;
  }

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-secondary sm:aspect-[5/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Link
          key={`${slide.href}-${slide.src}`}
          href={slide.href}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
          )}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </Link>
      ))}
      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-3 z-[2] flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={`${slide.href}-dot`}
              type="button"
              aria-label={`Show ${slide.alt}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-gold" : "w-1.5 bg-white/80 hover:bg-white",
              )}
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
