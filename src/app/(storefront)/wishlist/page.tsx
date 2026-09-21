import { EmptyState } from "@/components/storefront/empty-state";

export const metadata = { title: "Wishlist" };

export default function Page() {
  return (
    <div className="store-wrap py-16">
      <h1 className="font-heading text-4xl">Saved for later</h1>
      <EmptyState
        className="mt-8"
        title="Nothing saved yet."
        description="Tap the heart on a cake you are not ready to commit to."
        action={{ href: "/shop", label: "Browse" }}
      />
    </div>
  );
}
