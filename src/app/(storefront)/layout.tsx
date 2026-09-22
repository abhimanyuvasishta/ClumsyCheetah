import { getStorefrontConfig } from "@/lib/storefront/queries";
import { AnnouncementBar, StoreHeader } from "@/components/storefront/header";
import { StoreFooter } from "@/components/storefront/footer";
import { CartProvider } from "@/components/storefront/cart-provider";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { MobileNavigation } from "@/components/storefront/mobile-navigation";
import { StorefrontTheme } from "@/components/storefront/storefront-theme";
import { listCategories, listProducts } from "@/lib/catalog/queries";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, products, appearance] = await Promise.all([
    listCategories(),
    listProducts(),
    getStorefrontConfig(),
  ]);
  const upsells = products.filter((p) => p.isBestseller).slice(0, 3);

  return (
    <StorefrontTheme config={appearance} className="flex min-h-full flex-1 flex-col bg-background pb-14 md:pb-0">
      <CartProvider>
        {appearance.layout.showAnnouncement ? <AnnouncementBar /> : null}
        <StoreHeader categories={categories} />
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <MobileNavigation />
        <CartDrawer upsells={upsells} />
        <SearchOverlay products={products} />
      </CartProvider>
    </StorefrontTheme>
  );
}