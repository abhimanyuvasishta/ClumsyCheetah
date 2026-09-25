import { listAdminCategories } from "@/lib/admin/catalog";
import { listOfferPickerProducts } from "@/lib/offers/admin";
import { OfferForm } from "@/app/admin/offers/offer-form";

export default async function NewOfferPage() {
  let products: Awaited<ReturnType<typeof listOfferPickerProducts>> = [];
  let categories: Awaited<ReturnType<typeof listAdminCategories>> = [];
  try {
    [products, categories] = await Promise.all([listOfferPickerProducts(), listAdminCategories()]);
  } catch {
    products = [];
    categories = [];
  }
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">New offer</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick products with the same filters customers use on the shop, or leave products empty for a shop-wide code.
      </p>
      <OfferForm products={products} categories={categories} />
    </div>
  );
}
