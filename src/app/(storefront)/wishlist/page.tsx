import { EmptyState } from "@/components/storefront/empty-state";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Wishlist" };

export default async function Page() {
  const { pages } = await getStorefrontConfig();
  return (
    <div className="store-wrap py-16">
      <h1 className="font-heading text-4xl">{pages.wishlist.heading}</h1>
      <EmptyState
        className="mt-8"
        title={pages.wishlist.emptyTitle}
        description={pages.wishlist.emptyBody}
        action={{ href: "/shop", label: "Browse" }}
      />
    </div>
  );
}
