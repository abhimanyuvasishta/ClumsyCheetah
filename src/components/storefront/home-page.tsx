import Image from "next/image";
import Link from "next/link";
import { Wheat, Heart, Sparkles, Truck } from "lucide-react";
import { HeroSlideshow, type HeroSlide } from "@/components/storefront/hero-slideshow";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/storefront/price";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { startingPrice } from "@/lib/catalog/pricing";
import type { StorefrontConfig } from "@/lib/storefront/config";
import { cn } from "@/lib/utils";
import type { CatalogCategory, CatalogProduct } from "@/types/catalog";

const valueIcons = [Wheat, Sparkles, Heart, Truck];

export function HomePage({
  categories,
  bestsellers,
  signature,
  heroImage,
  heroSlides,
  appearance,
}: {
  categories: CatalogCategory[];
  bestsellers: CatalogProduct[];
  signature: CatalogProduct | null;
  heroImage: string;
  heroSlides: HeroSlide[];
  appearance: StorefrontConfig;
}) {
  const copy = appearance.home;
  const show = appearance.layout.homeSections;
  const ordered = copy.categoryOrder
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is CatalogCategory => Boolean(c));
  const sigVariant = signature ? startingPrice(signature) : undefined;
  const stacked = appearance.layout.heroPlacement === "stacked";
  const imageFirst = appearance.layout.heroPlacement === "image-left";
  const slides = heroSlides.length ? heroSlides : [{ src: heroImage, alt: "Bakes from Clumsy Cheetah", href: "/shop" }];

  const copyCol = (
    <div className={cn("reveal", stacked ? "" : "lg:col-span-6")}>
      <p className="eyebrow">{copy.hero.eyebrow}</p>
      <h1 className="mt-4 whitespace-pre-line font-heading text-[2.7rem] leading-[0.95] sm:text-6xl lg:text-[4.4rem]">
        {copy.hero.headline}
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.hero.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={copy.hero.primaryCta.href} className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6")}>
          {copy.hero.primaryCta.label}
        </Link>
        <Link href={copy.hero.secondaryCta.href} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 rounded-full px-6")}>
          {copy.hero.secondaryCta.label}
        </Link>
      </div>
    </div>
  );

  const imageCol = (
    <div className={cn("relative", stacked ? "" : "lg:col-span-6")}>
      <div className="absolute -left-6 top-10 hidden size-40 rounded-full bg-gold/35 lg:block" aria-hidden />
      <div className="absolute -right-4 bottom-8 hidden size-28 rounded-full bg-sky/35 lg:block" aria-hidden />
      <HeroSlideshow slides={slides} />
    </div>
  );

  return (
    <div>
      <section
        className={cn(
          "store-wrap items-center gap-10 py-10 lg:gap-12 lg:py-16",
          stacked ? "flex flex-col" : "grid lg:grid-cols-12",
        )}
      >
        {imageFirst ? (
          <>
            {imageCol}
            {copyCol}
          </>
        ) : (
          <>
            {copyCol}
            {imageCol}
          </>
        )}
      </section>

      {show.values ? (
        <section className="border-y border-border/80 bg-secondary/50">
          <ul className="store-wrap grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
            {copy.values.map((item, i) => {
              const Icon = valueIcons[i] ?? Wheat;
              return (
                <li key={item.title} className="flex gap-3">
                  <Icon className="mt-0.5 size-5 text-sky-deep" aria-hidden />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {show.categories ? (
        <section className="store-wrap py-16 md:py-20">
          <h2 className="font-heading text-3xl md:text-4xl">Pick your kind of happy</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {ordered.map((c, i) => {
              const span =
                i === 0 ? "md:col-span-3 md:row-span-2 min-h-72" : i === 1 || i === 2 ? "md:col-span-3 min-h-40" : "md:col-span-2 min-h-44";
              return (
                <Link key={c.id} href={`/collections/${c.slug}`} className={cn("group relative overflow-hidden rounded-[1.15rem] bg-secondary", span)}>
                  {c.imageUrl ? (
                    <Image src={c.imageUrl} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : null}
                  <span className="absolute inset-0 bg-navy/35" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className="block font-heading text-2xl">{c.name}</span>
                    <span className="mt-1 block text-sm text-white/85">{copy.categoryCopy[c.slug] ?? c.description}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {show.bestsellers ? (
        <ProductCarousel
          heading={copy.bestsellers.heading}
          subheading={copy.bestsellers.subheading}
          href="/collections/best-sellers"
          products={bestsellers}
        />
      ) : null}

      {show.campaign ? (
        <section className="store-wrap grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-secondary sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={heroSlides[1]?.src ?? heroImage} alt="" fill className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">Campaign</p>
            <h2 className="mt-3 font-heading text-4xl md:text-5xl">{copy.campaign.heading}</h2>
            <p className="mt-4 max-w-md text-muted-foreground">{copy.campaign.body}</p>
            <Link href={copy.campaign.cta.href} className={cn(buttonVariants(), "mt-8 h-12 rounded-full px-6")}>
              {copy.campaign.cta.label}
            </Link>
          </div>
        </section>
      ) : null}

      {show.signature && signature && sigVariant ? (
        <section className="mt-10 bg-navy py-16 text-cream md:py-24">
          <div className="store-wrap grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] ring-2 ring-sky/40">
              <Image src={signature.thumbnailUrl ?? heroImage} alt={signature.name} fill className="object-cover" />
            </div>
            <div>
              <p className="eyebrow text-sky">Signature</p>
              <h2 className="mt-3 font-heading text-4xl md:text-5xl">{copy.signature.heading}</h2>
              <p className="mt-4 font-heading text-2xl">{signature.name}</p>
              <p className="mt-3 max-w-md text-cream/80">{signature.longDescription ?? signature.shortDescription}</p>
              <div className="mt-6">
                <Price paise={sigVariant.pricePaise} compareAtPaise={sigVariant.compareAtPaise} className="text-xl" />
              </div>
              <div className="mt-6 max-w-xs">
                <AddToCartButton product={signature} variant={sigVariant} className="bg-gold text-espresso hover:bg-gold/90" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {show.occasions ? (
        <section className="store-wrap py-16 md:py-20">
          <h2 className="font-heading text-3xl md:text-4xl">{copy.occasions.heading}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {copy.occasions.items.map((item, i) => (
              <Link key={item.slug} href={`/collections/${item.slug}`} className="group relative min-h-40 overflow-hidden rounded-[1.1rem] bg-secondary">
                {slides[i % slides.length] ? (
                  <Image src={slides[i % slides.length].src} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" />
                ) : null}
                <span className="absolute inset-0 bg-navy/30" />
                <span className="absolute bottom-3 left-3 font-heading text-xl text-white">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {show.story ? (
        <section className="store-wrap grid gap-8 py-10 lg:grid-cols-2 lg:items-center">
          <h2 className="font-heading text-4xl md:text-5xl">{copy.story.heading}</h2>
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">{copy.story.body}</p>
            <Link href={copy.story.cta.href} className={cn(buttonVariants({ variant: "outline" }), "mt-6 h-11 rounded-full px-5")}>
              {copy.story.cta.label}
            </Link>
          </div>
        </section>
      ) : null}

      {show.testimonials ? (
        <section className="store-wrap py-16">
          <h2 className="font-heading text-3xl">From the counter</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-[1.15rem] bg-secondary/70 p-6">
                <p className="font-heading text-xl leading-snug">“{t.quote}”</p>
                <footer className="mt-5 text-sm text-muted-foreground">
                  {t.name}
                  {t.product ? ` · ${t.product}` : null}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}

      {show.social ? (
        <section className="py-8">
          <div className="store-wrap flex items-end justify-between">
            <h2 className="font-heading text-3xl">{copy.social.heading}</h2>
            <a href={copy.social.cta.href} className="text-sm underline underline-offset-4">
              {copy.social.cta.label}
            </a>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-1 sm:grid-cols-4">
            {(bestsellers.slice(0, 4).map((p) => p.thumbnailUrl).filter(Boolean) as string[]).map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden bg-secondary">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {show.newsletter ? (
        <section className="store-wrap py-16 text-center md:py-24">
          <h2 className="whitespace-pre-line font-heading text-4xl md:text-5xl">{copy.newsletter.heading}</h2>
          <form className="mx-auto mt-8 flex max-w-md gap-2">
            <label htmlFor="news-email" className="sr-only">
              Email
            </label>
            <input id="news-email" type="email" required placeholder="Email" className="h-12 flex-1 rounded-full border bg-surface px-5" />
            <button type="submit" className={cn(buttonVariants(), "h-12 rounded-full px-5")}>
              Sign me up
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">{copy.newsletter.note}</p>
        </section>
      ) : null}
    </div>
  );
}
