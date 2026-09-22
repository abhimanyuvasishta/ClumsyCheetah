import { HomePage } from "@/components/storefront/home-page";
import type { HeroSlide } from "@/components/storefront/hero-slideshow";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import { getProductBySlug, listCategories, listProducts, listProductsByCollection } from "@/lib/catalog/queries";
import type { CatalogProduct } from "@/types/catalog";

function slidesFromProducts(products: CatalogProduct[]): HeroSlide[] {
  const seen = new Set<string>();
  const slides: HeroSlide[] = [];
  for (const product of products) {
    const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
    const src = primary?.url ?? product.thumbnailUrl;
    if (!src || seen.has(src)) continue;
    seen.add(src);
    slides.push({
      src,
      alt: primary?.alt ?? product.name,
      href: `/products/${product.slug}`,
    });
    if (slides.length >= 10) break;
  }
  return slides;
}

export default async function Page() {
  const [categories, bestsellers, featured, catalog, appearance] = await Promise.all([
    listCategories(),
    listProductsByCollection("best-sellers"),
    listProducts({ bestseller: true }),
    listProducts(),
    getStorefrontConfig(),
  ]);
  const loved = bestsellers.length ? bestsellers : featured;
  const signature =
    (await getProductBySlug(appearance.home.signature.fallbackSlug)) ?? loved[0] ?? null;
  const ranked = [
    ...loved,
    ...catalog.filter((product) => !loved.some((lovedProduct) => lovedProduct.id === product.id)),
  ];
  const heroSlides = slidesFromProducts(ranked);
  const heroImage =
    heroSlides[0]?.src ??
    signature?.thumbnailUrl ??
    loved[0]?.thumbnailUrl ??
    categories[0]?.imageUrl ??
    "/brand/logo.svg";

  return (
    <HomePage
      categories={categories}
      bestsellers={loved}
      signature={signature}
      heroImage={heroImage}
      heroSlides={heroSlides}
      appearance={appearance}
    />
  );
}
