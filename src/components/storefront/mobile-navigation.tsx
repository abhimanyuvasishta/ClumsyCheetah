"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, Store, User } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();
  const { setSearchOpen } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        <li>
          <Link href="/" className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[10px]", pathname === "/" ? "text-foreground" : "text-muted-foreground")}>
            <Home className="size-5" />
            Home
          </Link>
        </li>
        <li>
          <Link href="/shop" className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[10px]", pathname.startsWith("/shop") || pathname.startsWith("/collections") ? "text-foreground" : "text-muted-foreground")}>
            <Store className="size-5" />
            Shop
          </Link>
        </li>
        <li>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
            <Search className="size-5" />
            Search
          </button>
        </li>
        <li>
          <Link href="/wishlist" className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[10px]", pathname.startsWith("/wishlist") ? "text-foreground" : "text-muted-foreground")}>
            <Heart className="size-5" />
            Saved
          </Link>
        </li>
        <li>
          <Link href="/account" className={cn("flex h-14 flex-col items-center justify-center gap-0.5 text-[10px]", pathname.startsWith("/account") || pathname.startsWith("/login") ? "text-foreground" : "text-muted-foreground")}>
            <User className="size-5" />
            Account
          </Link>
        </li>
      </ul>
    </nav>
  );
}
