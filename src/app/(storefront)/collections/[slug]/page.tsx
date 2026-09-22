import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/storefront/product-grid";
import { EmptyState } from "@/components/storefront/empty-state";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { categoryHeroCopy } from "@/data/homepage";
import { getStorefrontConfig } from "@/lib/storefront/queries";
import { listCategories, listCollections, listProductsByCollection } from "@/lib/catalog/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [cats, cols, appearance] = await Promise.all([listCategories(), listCollections(), getStorefrontConfig()]);
  const named = [...cats, ...cols].find((c) => c.slug === slug);
  const hero = appearance.collections[slug] ?? categoryHeroCopy[slug];
  return {
    title: named?.name ?? "Collection",
    description: hero?.body ?? named?.description ?? undefined,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [cats, cols, products, appearance] = await Promise.all([
    listCategories(),
    listCollections(),
    listProductsByCollection(slug),
    getStorefrontConfig(),
  ]);
  const named = [...cats, ...cols].find((c) => c.slug === slug);
  const hero = appearance.collections[slug] ?? categoryHeroCopy[slug];
  const image = named && "imageUrl" in named ? named.imageUrl : null;
  const featured = products.filter((p) => p.isFeatured || p.isBestseller).slice(0, 4);
  const related = cols.filter((c) => c.slug !== slug).slice(0, 4);

  return (
    <div>
      <div className={`relative min-h-[42vh] overflow-hidden ${appearance.layout.collectionHero === "cream" ? "bg-cream text-espresso" : "bg-navy text-cream"}`}>
        {image ? <Image src={image} alt="" fill className="object-cover opacity-45" priority /> : null}
        <div className="store-wrap relative py-16 md:py-24">
          <Breadcrumbs
            className="text-white/70 [&_span.text-foreground]:text-white"
            items={[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              { label: named?.name ?? slug },
            ]}
          />
          <h1 className="mt-6 max-w-2xl font-heading text-4xl md:text-6xl">{hero?.heading ?? named?.name ?? slug}</h1>
          <p className={`mt-4 max-w-xl ${appearance.layout.collectionHero === "cream" ? "text-muted-foreground" : "text-cream/80"}`}>{hero?.body ?? named?.description}</p>
        </div>
      </div>
      <div className="store-wrap py-12">
        {featured.length ? (
          <section className="mb-14">
            <h2 className="font-heading text-3xl">Start here</h2>
            <div className="mt-6">
              <ProductGrid products={featured} />
            </div>
          </section>
        ) : null}
        <h2 className="font-heading text-3xl">All in {named?.name ?? "this collection"}</h2>
        {products.length === 0 ? (
          <EmptyState className="mt-8" title="Oops. We ate the last one." description="This tray is empty for now." action={{ href: "/shop", label: "Shop all" }} />
        ) : (
          <div className="mt-6">
            <ProductGrid products={products} />
          </div>
        )}
        {related.length ? (
          <section className="mt-16">
            <h2 className="font-heading text-2xl">Related collections</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((c) => (
                <Link key={c.id} href={`/collections/${c.slug}`} className="rounded-full border px-4 py-2 text-sm">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
