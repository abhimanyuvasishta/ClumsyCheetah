import { CartProvider } from "@/components/storefront/cart-provider";
import { BrandMark } from "@/components/storefront/brand-mark";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
