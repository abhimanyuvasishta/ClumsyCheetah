import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import { ProductJsonLd } from "@/components/storefront/product-json-ld";
import { RecentlyViewedStrip } from "@/components/storefront/recently-viewed-strip";
import { getProductBySlug, listProducts, listRelatedProducts } from "@/lib/catalog/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.thumbnailUrl ? [product.thumbnailUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await listRelatedProducts(product);
  const catalog = await listProducts();
  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetail product={product} related={related} />
      <RecentlyViewedStrip products={catalog} currentSlug={product.slug} />
    </>
  );
}
