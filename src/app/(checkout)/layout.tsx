import { CartProvider } from "@/components/storefront/cart-provider";
import { BrandMark } from "@/components/storefront/brand-mark";
import { StorefrontTheme } from "@/components/storefront/storefront-theme";
import { ShopCommerceProvider } from "@/components/storefront/shop-commerce";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import { listLiveOffers } from "@/lib/offers/public";

export const dynamic = "force-dynamic";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const [appearance, offers] = await Promise.all([getStorefrontConfig(), listLiveOffers()]);
  return (
    <StorefrontTheme config={appearance}>
      <ShopCommerceProvider offers={offers}>
      <CartProvider>
        <div className="min-h-full bg-background">
          <header className="border-b">
            <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4">
              <BrandMark size="md" />
            </div>
          </header>
          {children}
        </div>
      </CartProvider>
      </ShopCommerceProvider>
    </StorefrontTheme>
  );
}