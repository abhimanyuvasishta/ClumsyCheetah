import { AnnouncementBar, StoreHeader } from "@/components/storefront/header";
import { StoreFooter } from "@/components/storefront/footer";
import { CartProvider } from "@/components/storefront/cart-provider";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { MobileNavigation } from "@/components/storefront/mobile-navigation";
import { listCategories, listProducts } from "@/lib/catalog/queries";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  const upsells = products.filter((p) => p.isBestseller).slice(0, 3);

  return (
    <CartProvider>
      <div className="flex min-h-full flex-1 flex-col bg-background pb-14 md:pb-0">
        <AnnouncementBar />
        <StoreHeader categories={categories} />
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <MobileNavigation />
        <CartDrawer upsells={upsells} />
        <SearchOverlay products={products} />
      </div>
    </CartProvider>
  );
}
