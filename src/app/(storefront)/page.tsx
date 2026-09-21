import { HomePage } from "@/components/storefront/home-page";
import { homepageContent } from "@/data/homepage";
import { getProductBySlug, listCategories, listProducts, listProductsByCollection } from "@/lib/catalog/queries";

export default async function Page() {
  const [categories, bestsellers, featured] = await Promise.all([
    listCategories(),
    listProductsByCollection("best-sellers"),
    listProducts({ bestseller: true }),
  ]);
  const loved = bestsellers.length ? bestsellers : featured;
  const signature =
    (await getProductBySlug(homepageContent.signature.fallbackSlug)) ?? loved[0] ?? null;
  const heroImage =
    signature?.thumbnailUrl ?? loved[0]?.thumbnailUrl ?? categories[0]?.imageUrl ?? "/brand/logo.svg";

  return <HomePage categories={categories} bestsellers={loved} signature={signature} heroImage={heroImage} />;
}
