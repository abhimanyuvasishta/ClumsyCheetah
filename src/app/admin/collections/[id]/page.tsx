import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/collection-form";
import { getAdminCollection, listAdminProducts } from "@/lib/admin/catalog";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Edit collection" };
export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [collection, products, appearance] = await Promise.all([
    getAdminCollection(id),
    listAdminProducts(),
    getStorefrontConfig(),
  ]);
  if (!collection) notFound();
  const banner = appearance.collections[collection.slug];
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Edit {collection.name}</h1>
      <CollectionForm
        collection={{ ...collection, bannerHeading: banner?.heading, bannerBody: banner?.body }}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
