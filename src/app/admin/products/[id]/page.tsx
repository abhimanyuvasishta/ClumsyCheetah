import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { VariantEditor } from "@/components/admin/variant-editor";
import { duplicateProduct, setProductStatus, updateProduct } from "@/app/admin/products/actions";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/catalog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);
  if (!product) notFound();
  const save = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-xs text-muted-foreground hover:underline">
            ← Catalog
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            Shop URL{" "}
            <Link href={`/products/${product.slug}`} className="underline">
              /products/{product.slug}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateProduct.bind(null, product.id)}>
            <Button type="submit" variant="outline" size="sm">
              Duplicate
            </Button>
          </form>
          {product.status !== "ACTIVE" ? (
            <form action={setProductStatus.bind(null, product.id, "ACTIVE")}>
              <Button type="submit" size="sm">
                Activate on shop
              </Button>
            </form>
          ) : (
            <form action={setProductStatus.bind(null, product.id, "INACTIVE")}>
              <Button type="submit" variant="outline" size="sm">
                Take off shop
              </Button>
            </form>
          )}
          <form action={setProductStatus.bind(null, product.id, "ARCHIVED")}>
            <Button type="submit" variant="destructive" size="sm">
              Archive
            </Button>
          </form>
        </div>
      </div>
      <ProductForm action={save} product={product} categories={categories} submitLabel="Save product" />
      <section>
        <h2 className="text-sm font-medium">Variants</h2>
        <p className="mb-3 text-xs text-muted-foreground">Each row is a size or flavour. Price in rupees; stored as paise.</p>
        <VariantEditor productId={product.id} variants={product.product_variants ?? []} />
      </section>
      <Link href={`/products/${product.slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
        View on storefront
      </Link>
    </div>
  );
}
