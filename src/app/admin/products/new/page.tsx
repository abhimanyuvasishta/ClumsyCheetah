import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/products/actions";
import { listAdminCategories } from "@/lib/admin/catalog";

export default async function NewProductPage() {
  const categories = await listAdminCategories();
  return (
    <div>
      <Link href="/admin/products" className="text-xs text-muted-foreground hover:underline">
        ← Catalog
      </Link>
      <h1 className="mt-2 text-xl font-semibold">New product</h1>
      <p className="mt-1 text-sm text-muted-foreground">Price is entered in rupees. The server stores integer paise.</p>
      <div className="mt-6">
        <ProductForm action={createProduct} categories={categories} submitLabel="Create product" />
      </div>
    </div>
  );
}
