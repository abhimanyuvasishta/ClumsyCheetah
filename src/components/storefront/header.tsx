"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { BrandMark } from "@/components/storefront/brand-mark";
import { useCart } from "@/components/storefront/cart-provider";
import { homepageContent } from "@/data/homepage";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/types/catalog";

export function AnnouncementBar() {
  return (
    <div className="bg-primary px-4 py-1.5 text-center text-[11px] tracking-[0.12em] text-primary-foreground">
      {homepageContent.announcement}
    </div>
  );
}

export function StoreHeader({ categories }: { categories: CatalogCategory[] }) {
  const pathname = usePathname();
  const { count, setDrawerOpen, setSearchOpen } = useCart();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md transition-[padding,box-shadow] duration-300",
        compact ? "border-border shadow-[var(--shadow-soft)]" : "border-transparent",
      )}
    >
      <div className={cn("store-wrap flex items-center gap-3 transition-[padding] duration-300 sm:gap-4", compact ? "py-2" : "py-3")}>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="inline-flex size-11 items-center justify-center lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background p-0">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <BrandMark size="sm" />
            </SheetHeader>
            <nav className="flex flex-col px-4 pb-8">
              {homepageContent.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b py-3.5 text-lg"
                >
                  {item.label}
                </Link>
              ))}
              {categories.slice(0, 8).map((c) => (
                <Link key={c.id} href={`/collections/${c.slug}`} onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-muted-foreground">
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <BrandMark size={compact ? "sm" : "md"} />

        <nav className="ml-8 hidden items-center gap-7 lg:flex">
          {homepageContent.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[0.925rem] tracking-wide text-foreground/75 transition hover:text-sky-deep",
                pathname === item.href && "text-sky-deep",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </button>
          <Link href="/account" className="hidden size-11 items-center justify-center sm:inline-flex" aria-label="Account">
            <User className="size-5" />
          </Link>
          <Link href="/wishlist" className="hidden size-11 items-center justify-center sm:inline-flex" aria-label="Wishlist">
            <Heart className="size-5" />
          </Link>
          <button
            type="button"
            className="relative inline-flex size-11 items-center justify-center"
            aria-label={`Bag, ${count} items`}
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag className="size-5" />
            {count > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
