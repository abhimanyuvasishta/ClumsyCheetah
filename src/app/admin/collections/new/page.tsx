import { CollectionForm } from "@/components/admin/collection-form";
import { listAdminProducts } from "@/lib/admin/catalog";

export const metadata = { title: "New collection" };

export default async function NewCollectionPage() {
  const products = await listAdminProducts();
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">New collection page</h1>
      <CollectionForm products={products.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
