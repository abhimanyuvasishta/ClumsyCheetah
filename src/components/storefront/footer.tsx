"use client";

import Link from "next/link";
import { BrandMark } from "@/components/storefront/brand-mark";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";

export function StoreFooter() {
  const { chrome, layout, home } = useStorefrontConfig();

  return (
    <footer className="mt-auto border-t border-sky/20 bg-navy text-cream">
      <div className="store-wrap grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandMark onDark size="lg" />
          <p className="mt-4 max-w-sm text-sm text-cream/75">{chrome.footerBlurb}</p>
          {layout.showFooterNewsletter ? (
            <form className="mt-6 flex max-w-sm gap-2">
              <label className="sr-only" htmlFor="footer-email">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="Email"
                className="h-11 flex-1 rounded-full border border-white/20 bg-white/5 px-4 text-sm"
              />
              <button type="submit" className="h-11 rounded-full bg-gold px-4 text-sm text-espresso">
                Join
              </button>
            </form>
          ) : null}
        </div>
        <div>
          <p className="eyebrow text-sky">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {chrome.footerShop.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-sky">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/delivery" className="hover:underline">Delivery</Link></li>
            <li><Link href="/account/orders" className="hover:underline">Track order</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-sky">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">Our story</Link></li>
            <li><Link href="/contact" className="hover:underline">Careers</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            <li>
              <a href={chrome.instagramUrl || home.social.cta.href} className="hover:underline">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="store-wrap flex flex-col gap-2 py-4 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Clumsy Cheetah. Baked in Mumbai.</p>
          <p>UPI · Cards · COD — through checkout, never stored here.</p>
        </div>
      </div>
    </footer>
  );
}