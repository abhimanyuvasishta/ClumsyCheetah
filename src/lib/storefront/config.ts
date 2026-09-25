import { categoryHeroCopy, homepageContent } from "@/data/homepage";

export const STOREFRONT_SETTINGS_KEY = "storefront";

export type ThemeColors = {
  cream: string;
  gold: string;
  sky: string;
  skyDeep: string;
  navy: string;
  espresso: string;
  caramel: string;
};

export const COLOR_PRESETS: Record<"seal" | "bakery" | "midnight", ThemeColors> = {
  seal: {
    cream: "#F7F1E4",
    gold: "#E6B14A",
    sky: "#7EB8D9",
    skyDeep: "#3D8FBF",
    navy: "#2F5874",
    espresso: "#3A322C",
    caramel: "#D49A2C",
  },
  bakery: {
    cream: "#F8F1E3",
    gold: "#D4A017",
    sky: "#C4A484",
    skyDeep: "#4A3424",
    navy: "#2C1E14",
    espresso: "#2C1A10",
    caramel: "#8B5A2B",
  },
  midnight: {
    cream: "#F4F7FB",
    gold: "#E8B84A",
    sky: "#8EC5E8",
    skyDeep: "#1F4E79",
    navy: "#0F2740",
    espresso: "#122033",
    caramel: "#C98A2E",
  },
};

export type ColorPresetId = keyof typeof COLOR_PRESETS | "custom";
export type HeroPlacement = "image-right" | "image-left" | "stacked";
export type ProductGridDensity = "comfortable" | "compact";
export type CollectionHeroStyle = "navy" | "cream";

export type NavLink = { href: string; label: string };
export type Cta = { href: string; label: string };
export type CopyPage = { eyebrow?: string; heading: string; body: string };

export type StorefrontConfig = {
  version: 1;
  theme: { preset: ColorPresetId; colors: ThemeColors };
  layout: {
    heroPlacement: HeroPlacement;
    headerSticky: boolean;
    showAnnouncement: boolean;
    showFooterNewsletter: boolean;
    productGrid: ProductGridDensity;
    collectionHero: CollectionHeroStyle;
    homeSections: {
      values: boolean;
      categories: boolean;
      bestsellers: boolean;
      campaign: boolean;
      signature: boolean;
      occasions: boolean;
      story: boolean;
      testimonials: boolean;
      social: boolean;
      newsletter: boolean;
    };
  };
  chrome: {
    announcement: string;
    footerBlurb: string;
    instagramUrl: string;
    nav: NavLink[];
    footerShop: NavLink[];
    popularSearches: string[];
    freeDeliveryThresholdPaise: number;
  };
  home: {
    hero: { eyebrow: string; headline: string; body: string; primaryCta: Cta; secondaryCta: Cta };
    values: { title: string; text: string }[];
    categoryCopy: Record<string, string>;
    categoryOrder: string[];
    bestsellers: { heading: string; subheading: string };
    campaign: { heading: string; body: string; cta: Cta };
    signature: { heading: string; fallbackSlug: string };
    occasions: { heading: string; items: { slug: string; label: string }[] };
    story: { heading: string; body: string; cta: Cta };
    testimonials: { name: string; product: string; quote: string }[];
    social: { heading: string; cta: Cta };
    newsletter: { heading: string; note: string };
  };
  pages: {
    shop: CopyPage;
    about: CopyPage;
    contact: CopyPage;
    faq: CopyPage;
    delivery: CopyPage;
    privacy: CopyPage;
    terms: CopyPage;
    refunds: CopyPage;
    login: CopyPage;
    register: CopyPage;
    cart: CopyPage & { emptyTitle: string; emptyBody: string; emptyCta: string };
    checkout: CopyPage & { emptyTitle: string; emptyCta: string };
    wishlist: CopyPage & { emptyTitle: string; emptyBody: string };
    product: { addToCart: string };
  };
  collections: Record<string, { heading: string; body: string }>;
};

export const defaultStorefrontConfig: StorefrontConfig = {
  version: 1,
  theme: { preset: "seal", colors: { ...COLOR_PRESETS.seal } },
  layout: {
    heroPlacement: "image-right",
    headerSticky: true,
    showAnnouncement: true,
    showFooterNewsletter: true,
    productGrid: "comfortable",
    collectionHero: "navy",
    homeSections: {
      values: true,
      categories: true,
      bestsellers: true,
      campaign: true,
      signature: true,
      occasions: true,
      story: true,
      testimonials: true,
      social: true,
      newsletter: true,
    },
  },
  chrome: {
    announcement: homepageContent.announcement,
    footerBlurb: "A Bandra bakery that takes pastry seriously and itself only slightly less so.",
    instagramUrl: homepageContent.social.cta.href,
    nav: homepageContent.nav.map((item) => ({ ...item })),
    footerShop: [
      { label: "Cakes", href: "/collections/cakes" },
      { label: "Brownies", href: "/collections/brownies" },
      { label: "Cookies", href: "/collections/cookies" },
      { label: "Desserts", href: "/collections/desserts" },
      { label: "Gifting", href: "/collections/gift-hampers" },
    ],
    popularSearches: [...homepageContent.popularSearches],
    freeDeliveryThresholdPaise: homepageContent.freeDeliveryThresholdPaise,
  },
  home: {
    hero: {
      eyebrow: homepageContent.hero.eyebrow,
      headline: homepageContent.hero.headline,
      body: homepageContent.hero.body,
      primaryCta: { ...homepageContent.hero.primaryCta },
      secondaryCta: { ...homepageContent.hero.secondaryCta },
    },
    values: homepageContent.values.map((item) => ({ ...item })),
    categoryCopy: { ...homepageContent.categoryCopy },
    categoryOrder: [...homepageContent.categoryOrder],
    bestsellers: { ...homepageContent.bestsellers },
    campaign: { heading: homepageContent.campaign.heading, body: homepageContent.campaign.body, cta: { ...homepageContent.campaign.cta } },
    signature: { ...homepageContent.signature },
    occasions: {
      heading: homepageContent.occasions.heading,
      items: homepageContent.occasions.items.map(({ slug, label }) => ({ slug, label })),
    },
    story: { heading: homepageContent.story.heading, body: homepageContent.story.body, cta: { ...homepageContent.story.cta } },
    testimonials: homepageContent.testimonials.map((item) => ({ ...item })),
    social: { heading: homepageContent.social.heading, cta: { ...homepageContent.social.cta } },
    newsletter: { ...homepageContent.newsletter },
  },
  pages: {
    shop: {
      heading: "All the good stuff.",
      body: "Cakes, brownies, cookies and the hamper you actually want to give.",
    },
    about: {
      eyebrow: "Our story",
      heading: "Good things happen when you don’t take baking too seriously.",
      body: "Clumsy Cheetah started as a kitchen that wanted better ganache and a worse name. We bake in Bandra: laminated mornings, chocolate afternoons, and boxes that leave looking proud. The clumsiness is in the branding, not the crumb.",
    },
    contact: {
      heading: "Contact",
      body: "Kitchen: Bandra, Mumbai. Email and WhatsApp wiring come with notifications in a later phase.",
    },
    faq: {
      heading: "FAQ",
      body: "Eggless options are marked on every product. Same-day depends on slot capacity and pin code.",
    },
    delivery: {
      heading: "Delivery",
      body: "Seeded pins: 400050, 400052, 400058. Slots and fees are admin-configurable.",
    },
    privacy: {
      heading: "Privacy policy",
      body: "We store accounts in Supabase. We never store card PAN.",
    },
    terms: {
      heading: "Terms & conditions",
      body: "Replace with counsel-reviewed terms before you treat this as legal copy.",
    },
    refunds: {
      heading: "Refund & cancellation",
      body: "Cancellations depend on prep status. Refunds flow through the payment you chose at checkout.",
    },
    login: {
      eyebrow: "Welcome back",
      heading: "The usual table?",
      body: "We’ll remember your bag, your pins, and the cake you always mean to reorder.",
    },
    register: {
      eyebrow: "Join the bakery",
      heading: "Save your usual order.",
      body: "By continuing you agree to our privacy note.",
    },
    cart: {
      heading: "Your bag",
      body: "Review quantities, then check out.",
      emptyTitle: "Your cart is feeling a little lonely.",
      emptyBody: "A cookie box usually fixes this.",
      emptyCta: "Shop the good stuff",
    },
    checkout: {
      heading: "Checkout",
      body: "Pay with UPI QR at checkout.",
      emptyTitle: "Nothing to check out yet.",
      emptyCta: "Shop the good stuff",
    },
    wishlist: {
      heading: "Saved for later",
      body: "Hearts you tap on the shop land here.",
      emptyTitle: "Nothing saved yet.",
      emptyBody: "Tap the heart on a bake you are not ready to commit to.",
    },
    product: { addToCart: "Add to cart" },
  },
  collections: Object.fromEntries(
    Object.entries(categoryHeroCopy).map(([slug, copy]) => [slug, { ...copy }]),
  ),
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, overlay: unknown): T {
  if (overlay === undefined || overlay === null) return base;
  if (!isPlainObject(base) || !isPlainObject(overlay)) return overlay as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined) continue;
    const current = (base as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      out[key] = value;
    } else if (isPlainObject(current) && isPlainObject(value)) {
      out[key] = deepMerge(current, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

const HEX = /^#([0-9a-fA-F]{6})$/;

export function sanitizeHref(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("mailto:")) return trimmed;
  return "/";
}

function sanitizeColors(colors: ThemeColors): ThemeColors {
  const next = { ...COLOR_PRESETS.seal };
  for (const key of Object.keys(next) as (keyof ThemeColors)[]) {
    const candidate = colors[key];
    next[key] = HEX.test(candidate) ? candidate : COLOR_PRESETS.seal[key];
  }
  return next;
}

function walkHrefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(walkHrefs);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if ((key === "href" || key === "instagramUrl") && typeof child === "string") {
      out[key] = sanitizeHref(child);
    } else {
      out[key] = walkHrefs(child);
    }
  }
  return out;
}

export function mergeStorefrontConfig(raw: unknown): StorefrontConfig {
  const merged = deepMerge(defaultStorefrontConfig, raw);
  merged.version = 1;
  merged.theme.colors = sanitizeColors(merged.theme.colors);
  if (merged.theme.preset !== "custom" && !(merged.theme.preset in COLOR_PRESETS)) {
    merged.theme.preset = "seal";
  }
  merged.chrome.nav = merged.chrome.nav
    .filter((item) => item.label.trim())
    .map((item) => ({ label: item.label.trim(), href: sanitizeHref(item.href) }));
  if (!merged.chrome.nav.length) merged.chrome.nav = defaultStorefrontConfig.chrome.nav;
  merged.chrome.footerShop = merged.chrome.footerShop
    .filter((item) => item.label.trim())
    .map((item) => ({ label: item.label.trim(), href: sanitizeHref(item.href) }));
  merged.chrome.popularSearches = merged.chrome.popularSearches.map((term) => term.trim()).filter(Boolean);
  const threshold = Number(merged.chrome.freeDeliveryThresholdPaise);
  merged.chrome.freeDeliveryThresholdPaise = Number.isFinite(threshold) && threshold > 0 ? Math.round(threshold) : defaultStorefrontConfig.chrome.freeDeliveryThresholdPaise;
  return walkHrefs(merged) as StorefrontConfig;
}

export function storefrontCssVars(colors: ThemeColors): Record<string, string> {
  const secondary = `color-mix(in srgb, ${colors.sky} 22%, ${colors.cream})`;
  const muted = `color-mix(in srgb, ${colors.sky} 12%, ${colors.cream})`;
  const border = `color-mix(in srgb, ${colors.navy} 16%, ${colors.cream})`;
  const tokens: Record<string, string> = {
    "--cream": colors.cream,
    "--surface": colors.cream,
    "--espresso": colors.espresso,
    "--caramel": colors.caramel,
    "--gold": colors.gold,
    "--sky": colors.sky,
    "--sky-deep": colors.skyDeep,
    "--navy": colors.navy,
    "--blush": colors.sky,
    "--background": colors.cream,
    "--foreground": colors.espresso,
    "--card": colors.cream,
    "--card-foreground": colors.espresso,
    "--primary": colors.skyDeep,
    "--primary-foreground": colors.cream,
    "--secondary": secondary,
    "--secondary-foreground": colors.espresso,
    "--muted": muted,
    "--muted-foreground": `color-mix(in srgb, ${colors.espresso} 62%, ${colors.cream})`,
    "--accent": colors.caramel,
    "--accent-foreground": colors.espresso,
    "--border": border,
    "--input": border,
    "--ring": colors.sky,
  };
  for (const [key, value] of Object.entries(tokens)) {
    tokens[`--color-${key.slice(2)}`] = value;
  }
  return tokens;
}
