"use client";

import { useActionState, useState } from "react";
import { saveStorefrontAppearance, type AppearanceState } from "@/app/admin/appearance/actions";
import {
  COLOR_PRESETS,
  defaultStorefrontConfig,
  type ColorPresetId,
  type StorefrontConfig,
  type ThemeColors,
} from "@/lib/storefront/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { paiseToRupeesInput, rupeesToPaise } from "@/lib/money";

const tabs = [
  { id: "theme", label: "Colour" },
  { id: "layout", label: "Layout" },
  { id: "chrome", label: "Header & footer" },
  { id: "home", label: "Home writeups" },
  { id: "pages", label: "All pages" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "h-9 w-full rounded-lg border bg-white px-2.5 text-sm";
const areaClass = "min-h-24 w-full rounded-lg border bg-white px-2.5 py-2 text-sm";

export function AppearanceEditor({ initial }: { initial: StorefrontConfig }) {
  const [tab, setTab] = useState<TabId>("theme");
  const [config, setConfig] = useState(initial);
  const [state, action, pending] = useActionState(saveStorefrontAppearance, {} as AppearanceState);

  function patch<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function applyPreset(id: Exclude<ColorPresetId, "custom">) {
    setConfig((current) => ({
      ...current,
      theme: { preset: id, colors: { ...COLOR_PRESETS[id] } },
    }));
  }

  function setColor(key: keyof ThemeColors, value: string) {
    setConfig((current) => ({
      ...current,
      theme: { preset: "custom", colors: { ...current.theme.colors, [key]: value } },
    }));
  }

  return (
    <form
      action={() => {
        const payload = new FormData();
        payload.set("payload", JSON.stringify(config));
        return action(payload);
      }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Website appearance</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            One save updates what customers see: colours, layout, and copy on every storefront page. Catalog prices stay in Catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            onClick={() => setConfig(defaultStorefrontConfig)}
          >
            Reset defaults
          </button>
          <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "sm" }))}>
            {pending ? "Publishing…" : "Publish to website"}
          </button>
        </div>
      </div>
      {state.error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p> : null}
      {state.ok ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">Published. Open View storefront to check.</p> : null}

      <div className="flex flex-wrap gap-1 border-b pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn("rounded-full px-3 py-1.5 text-sm", tab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "theme" ? (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">Pick a scheme or mix your own. These colours drive buttons, announcement bar, footer, and page background.</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COLOR_PRESETS) as Exclude<ColorPresetId, "custom">[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={cn("rounded-full border px-3 py-1.5 text-sm capitalize", config.theme.preset === id && "border-primary bg-muted")}
              >
                {id}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["cream", "Page background"],
                ["skyDeep", "Buttons / primary"],
                ["sky", "Highlights"],
                ["navy", "Footer / heroes"],
                ["gold", "Accents"],
                ["espresso", "Text"],
                ["caramel", "Warm accent"],
              ] as [keyof ThemeColors, string][]
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex gap-2">
                  <input type="color" value={config.theme.colors[key]} onChange={(e) => setColor(key, e.target.value)} className="h-9 w-12 rounded border" />
                  <input className={inputClass} value={config.theme.colors[key]} onChange={(e) => setColor(key, e.target.value)} />
                </div>
              </Field>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "layout" ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Home hero layout">
            <select
              className={inputClass}
              value={config.layout.heroPlacement}
              onChange={(e) => patch("layout", { ...config.layout, heroPlacement: e.target.value as StorefrontConfig["layout"]["heroPlacement"] })}
            >
              <option value="image-right">Copy left, photos right</option>
              <option value="image-left">Photos left, copy right</option>
              <option value="stacked">Stacked (copy then photos)</option>
            </select>
          </Field>
          <Field label="Product grid">
            <select
              className={inputClass}
              value={config.layout.productGrid}
              onChange={(e) => patch("layout", { ...config.layout, productGrid: e.target.value as StorefrontConfig["layout"]["productGrid"] })}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
          <Field label="Collection banner">
            <select
              className={inputClass}
              value={config.layout.collectionHero}
              onChange={(e) => patch("layout", { ...config.layout, collectionHero: e.target.value as StorefrontConfig["layout"]["collectionHero"] })}
            >
              <option value="navy">Navy band</option>
              <option value="cream">Cream band</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.layout.headerSticky} onChange={(e) => patch("layout", { ...config.layout, headerSticky: e.target.checked })} />
            Sticky header
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.layout.showAnnouncement} onChange={(e) => patch("layout", { ...config.layout, showAnnouncement: e.target.checked })} />
            Show announcement bar
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={config.layout.showFooterNewsletter} onChange={(e) => patch("layout", { ...config.layout, showFooterNewsletter: e.target.checked })} />
            Footer email signup
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Home sections</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {Object.entries(config.layout.homeSections).map(([key, on]) => (
                <label key={key} className="flex items-center gap-2 text-sm capitalize">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) =>
                      patch("layout", {
                        ...config.layout,
                        homeSections: { ...config.layout.homeSections, [key]: e.target.checked },
                      })
                    }
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "chrome" ? (
        <section className="space-y-4">
          <Field label="Announcement bar">
            <input className={inputClass} value={config.chrome.announcement} onChange={(e) => patch("chrome", { ...config.chrome, announcement: e.target.value })} />
          </Field>
          <Field label="Footer blurb">
            <textarea className={areaClass} value={config.chrome.footerBlurb} onChange={(e) => patch("chrome", { ...config.chrome, footerBlurb: e.target.value })} />
          </Field>
          <Field label="Instagram URL">
            <input className={inputClass} value={config.chrome.instagramUrl} onChange={(e) => patch("chrome", { ...config.chrome, instagramUrl: e.target.value })} />
          </Field>
          <Field label="Free delivery from (₹)">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={paiseToRupeesInput(config.chrome.freeDeliveryThresholdPaise)}
              onChange={(e) => {
                try {
                  patch("chrome", { ...config.chrome, freeDeliveryThresholdPaise: rupeesToPaise(e.target.value || "0") });
                } catch {
                  /* ignore incomplete numbers */
                }
              }}
            />
          </Field>
          <p className="text-xs font-medium text-muted-foreground">Header navigation</p>
          {config.chrome.nav.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} value={item.label} onChange={(e) => {
                const nav = [...config.chrome.nav];
                nav[i] = { ...item, label: e.target.value };
                patch("chrome", { ...config.chrome, nav });
              }} />
              <input className={inputClass} value={item.href} onChange={(e) => {
                const nav = [...config.chrome.nav];
                nav[i] = { ...item, href: e.target.value };
                patch("chrome", { ...config.chrome, nav });
              }} />
            </div>
          ))}
          <p className="text-xs font-medium text-muted-foreground">Footer shop links</p>
          {config.chrome.footerShop.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} value={item.label} onChange={(e) => {
                const footerShop = [...config.chrome.footerShop];
                footerShop[i] = { ...item, label: e.target.value };
                patch("chrome", { ...config.chrome, footerShop });
              }} />
              <input className={inputClass} value={item.href} onChange={(e) => {
                const footerShop = [...config.chrome.footerShop];
                footerShop[i] = { ...item, href: e.target.value };
                patch("chrome", { ...config.chrome, footerShop });
              }} />
            </div>
          ))}
          <Field label="Popular searches (comma separated)">
            <input
              className={inputClass}
              value={config.chrome.popularSearches.join(", ")}
              onChange={(e) =>
                patch("chrome", {
                  ...config.chrome,
                  popularSearches: e.target.value.split(",").map((term) => term.trim()).filter(Boolean),
                })
              }
            />
          </Field>
        </section>
      ) : null}

      {tab === "home" ? (
        <section className="space-y-4">
          <Field label="Hero eyebrow">
            <input className={inputClass} value={config.home.hero.eyebrow} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, eyebrow: e.target.value } })} />
          </Field>
          <Field label="Hero headline (use a new line for a second line)">
            <textarea className={areaClass} value={config.home.hero.headline} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, headline: e.target.value } })} />
          </Field>
          <Field label="Hero body">
            <textarea className={areaClass} value={config.home.hero.body} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, body: e.target.value } })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary button label">
              <input className={inputClass} value={config.home.hero.primaryCta.label} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, primaryCta: { ...config.home.hero.primaryCta, label: e.target.value } } })} />
            </Field>
            <Field label="Primary button link">
              <input className={inputClass} value={config.home.hero.primaryCta.href} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, primaryCta: { ...config.home.hero.primaryCta, href: e.target.value } } })} />
            </Field>
            <Field label="Secondary button label">
              <input className={inputClass} value={config.home.hero.secondaryCta.label} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, secondaryCta: { ...config.home.hero.secondaryCta, label: e.target.value } } })} />
            </Field>
            <Field label="Secondary button link">
              <input className={inputClass} value={config.home.hero.secondaryCta.href} onChange={(e) => patch("home", { ...config.home, hero: { ...config.home.hero, secondaryCta: { ...config.home.hero.secondaryCta, href: e.target.value } } })} />
            </Field>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Value tiles</p>
          {config.home.values.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <input className={inputClass} value={item.title} onChange={(e) => {
                const values = [...config.home.values];
                values[i] = { ...item, title: e.target.value };
                patch("home", { ...config.home, values });
              }} />
              <input className={inputClass} value={item.text} onChange={(e) => {
                const values = [...config.home.values];
                values[i] = { ...item, text: e.target.value };
                patch("home", { ...config.home, values });
              }} />
            </div>
          ))}
          <Field label="Bestsellers heading">
            <input className={inputClass} value={config.home.bestsellers.heading} onChange={(e) => patch("home", { ...config.home, bestsellers: { ...config.home.bestsellers, heading: e.target.value } })} />
          </Field>
          <Field label="Campaign heading">
            <input className={inputClass} value={config.home.campaign.heading} onChange={(e) => patch("home", { ...config.home, campaign: { ...config.home.campaign, heading: e.target.value } })} />
          </Field>
          <Field label="Campaign body">
            <textarea className={areaClass} value={config.home.campaign.body} onChange={(e) => patch("home", { ...config.home, campaign: { ...config.home.campaign, body: e.target.value } })} />
          </Field>
          <Field label="Signature heading">
            <input className={inputClass} value={config.home.signature.heading} onChange={(e) => patch("home", { ...config.home, signature: { ...config.home.signature, heading: e.target.value } })} />
          </Field>
          <Field label="Signature product slug">
            <input className={inputClass} value={config.home.signature.fallbackSlug} onChange={(e) => patch("home", { ...config.home, signature: { ...config.home.signature, fallbackSlug: e.target.value } })} />
          </Field>
          <Field label="Story heading">
            <textarea className={areaClass} value={config.home.story.heading} onChange={(e) => patch("home", { ...config.home, story: { ...config.home.story, heading: e.target.value } })} />
          </Field>
          <Field label="Story body">
            <textarea className={areaClass} value={config.home.story.body} onChange={(e) => patch("home", { ...config.home, story: { ...config.home.story, body: e.target.value } })} />
          </Field>
          <Field label="Newsletter heading">
            <textarea className={areaClass} value={config.home.newsletter.heading} onChange={(e) => patch("home", { ...config.home, newsletter: { ...config.home.newsletter, heading: e.target.value } })} />
          </Field>
          <p className="text-xs font-medium text-muted-foreground">Testimonials</p>
          {config.home.testimonials.map((item, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-3">
              <input className={inputClass} placeholder="Name" value={item.name} onChange={(e) => {
                const testimonials = [...config.home.testimonials];
                testimonials[i] = { ...item, name: e.target.value };
                patch("home", { ...config.home, testimonials });
              }} />
              <input className={inputClass} placeholder="Product" value={item.product} onChange={(e) => {
                const testimonials = [...config.home.testimonials];
                testimonials[i] = { ...item, product: e.target.value };
                patch("home", { ...config.home, testimonials });
              }} />
              <input className={inputClass} placeholder="Quote" value={item.quote} onChange={(e) => {
                const testimonials = [...config.home.testimonials];
                testimonials[i] = { ...item, quote: e.target.value };
                patch("home", { ...config.home, testimonials });
              }} />
            </div>
          ))}
        </section>
      ) : null}

      {tab === "pages" ? (
        <section className="space-y-6">
          {(
            [
              ["shop", "Shop"],
              ["about", "About"],
              ["contact", "Contact"],
              ["faq", "FAQ"],
              ["delivery", "Delivery"],
              ["privacy", "Privacy"],
              ["terms", "Terms"],
              ["refunds", "Refunds"],
              ["login", "Login"],
              ["register", "Register"],
              ["wishlist", "Wishlist"],
            ] as const
          ).map(([key, title]) => {
            const page = config.pages[key];
            return (
              <div key={key} className="rounded-lg border bg-white p-4">
                <p className="mb-3 text-sm font-semibold">{title}</p>
                <div className="grid gap-3">
                  {"eyebrow" in page && page.eyebrow !== undefined ? (
                    <Field label="Eyebrow">
                      <input className={inputClass} value={page.eyebrow ?? ""} onChange={(e) => patch("pages", { ...config.pages, [key]: { ...page, eyebrow: e.target.value } })} />
                    </Field>
                  ) : null}
                  <Field label="Heading">
                    <input className={inputClass} value={page.heading} onChange={(e) => patch("pages", { ...config.pages, [key]: { ...page, heading: e.target.value } })} />
                  </Field>
                  <Field label="Body">
                    <textarea className={areaClass} value={page.body} onChange={(e) => patch("pages", { ...config.pages, [key]: { ...page, body: e.target.value } })} />
                  </Field>
                </div>
              </div>
            );
          })}
          <div className="rounded-lg border bg-white p-4">
            <p className="mb-3 text-sm font-semibold">Cart empty state</p>
            <div className="grid gap-3">
              <Field label="Heading">
                <input className={inputClass} value={config.pages.cart.heading} onChange={(e) => patch("pages", { ...config.pages, cart: { ...config.pages.cart, heading: e.target.value } })} />
              </Field>
              <Field label="Empty title">
                <input className={inputClass} value={config.pages.cart.emptyTitle} onChange={(e) => patch("pages", { ...config.pages, cart: { ...config.pages.cart, emptyTitle: e.target.value } })} />
              </Field>
              <Field label="Empty body">
                <input className={inputClass} value={config.pages.cart.emptyBody} onChange={(e) => patch("pages", { ...config.pages, cart: { ...config.pages.cart, emptyBody: e.target.value } })} />
              </Field>
              <Field label="Empty button">
                <input className={inputClass} value={config.pages.cart.emptyCta} onChange={(e) => patch("pages", { ...config.pages, cart: { ...config.pages.cart, emptyCta: e.target.value } })} />
              </Field>
            </div>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="mb-3 text-sm font-semibold">Checkout empty</p>
            <Field label="Empty title">
              <input className={inputClass} value={config.pages.checkout.emptyTitle} onChange={(e) => patch("pages", { ...config.pages, checkout: { ...config.pages.checkout, emptyTitle: e.target.value } })} />
            </Field>
            <Field label="Empty button">
              <input className={cn(inputClass, "mt-3")} value={config.pages.checkout.emptyCta} onChange={(e) => patch("pages", { ...config.pages, checkout: { ...config.pages.checkout, emptyCta: e.target.value } })} />
            </Field>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="mb-3 text-sm font-semibold">Product</p>
            <Field label="Add to cart label">
              <input className={inputClass} value={config.pages.product.addToCart} onChange={(e) => patch("pages", { ...config.pages, product: { addToCart: e.target.value } })} />
            </Field>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="mb-3 text-sm font-semibold">Collection banners</p>
            <div className="space-y-3">
              {Object.entries(config.collections).map(([slug, copy]) => (
                <div key={slug} className="grid gap-2 md:grid-cols-2">
                  <input className={inputClass} value={copy.heading} onChange={(e) => patch("collections", { ...config.collections, [slug]: { ...copy, heading: e.target.value } })} />
                  <input className={inputClass} value={copy.body} onChange={(e) => patch("collections", { ...config.collections, [slug]: { ...copy, body: e.target.value } })} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <button type="submit" disabled={pending} className={cn(buttonVariants())}>
        {pending ? "Publishing…" : "Publish to website"}
      </button>
    </form>
  );
}
