import Link from "next/link";
import { BrandMark } from "@/components/storefront/brand-mark";
import { homepageContent } from "@/data/homepage";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-espresso text-[oklch(0.93_0.02_80)]">
      <div className="store-wrap grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandMark onDark size="lg" />
          <p className="mt-4 max-w-sm text-sm text-[oklch(0.82_0.02_80)]">
            A Bandra bakery that takes pastry seriously and itself only slightly less so.
          </p>
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
            <button type="submit" className="h-11 rounded-full bg-[oklch(0.78_0.09_78)] px-4 text-sm text-espresso">
              Join
            </button>
          </form>
        </div>
        <div>
          <p className="eyebrow text-[oklch(0.75_0.04_70)]">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ["Cakes", "/collections/cakes"],
              ["Brownies", "/collections/brownies"],
              ["Cookies", "/collections/cookies"],
              ["Desserts", "/collections/desserts"],
              ["Gifting", "/collections/gift-hampers"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-[oklch(0.75_0.04_70)]">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/delivery" className="hover:underline">Delivery</Link></li>
            <li><Link href="/account/orders" className="hover:underline">Track order</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-[oklch(0.75_0.04_70)]">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">Our story</Link></li>
            <li><Link href="/contact" className="hover:underline">Careers</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy</Link></li>
            <li>
              <a href={homepageContent.social.cta.href} className="hover:underline">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="store-wrap flex flex-col gap-2 py-4 text-xs text-[oklch(0.72_0.02_80)] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Clumsy Cheetah. Baked in Mumbai.</p>
          <p>UPI · Cards · COD — through checkout, never stored here.</p>
        </div>
      </div>
    </footer>
  );
}
