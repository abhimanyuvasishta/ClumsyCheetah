/**
 * Storefront merchandising copy and section order.
 * Swap this object for CMS rows (homepage_sections / banners) later.
 * Product lists are never stored here — pages pass catalog records in.
 */
export const homepageContent = {
  announcement: "Freshly baked. Happily delivered.",
  nav: [
    { href: "/shop", label: "Shop" },
    { href: "/collections/cakes", label: "Cakes" },
    { href: "/collections/desserts", label: "Desserts" },
    { href: "/collections/cookies", label: "Cookies" },
    { href: "/collections/gift-hampers", label: "Gifting" },
    { href: "/about", label: "About" },
  ],
  hero: {
    eyebrow: "Bandra kitchen · same-day slots",
    headline: "Life’s too short\nfor boring cake.",
    body: "Handcrafted cakes, brownies, cookies and little moments of happiness — baked fresh and delivered to your door.",
    primaryCta: { href: "/shop", label: "Shop the good stuff" },
    secondaryCta: { href: "/collections/cakes", label: "Explore cakes" },
    imageSlugHint: "belgian-chocolate-truffle-cake",
  },
  values: [
    { title: "Freshly baked", text: "Not sitting pretty under a lamp." },
    { title: "Premium ingredients", text: "Butter that tastes like butter." },
    { title: "Made with love", text: "And a little clumsy swagger." },
    { title: "Doorstep delivery", text: "Mumbai pins, honest slots." },
  ],
  categoryCopy: {
    cakes: "For birthdays, breakups & everything between.",
    brownies: "Small squares. Big feelings.",
    cheesecakes: "The grown-up kind of drama.",
    cookies: "One is never enough.",
    pastries: "The case that empties by four.",
    desserts: "For when cake is too much of a decision.",
    "gift-hampers": "Looks like you tried. Tastes like you care.",
  } as Record<string, string>,
  categoryOrder: ["cakes", "brownies", "cheesecakes", "cookies", "pastries", "desserts", "gift-hampers"],
  bestsellers: {
    heading: "Everyone’s talking about these",
    subheading: "Our most-loved bakes.",
  },
  campaign: {
    heading: "Celebrations deserve better cake.",
    body: "A proper crumb, a tidy finish, and zero buffet energy. Order the kind of cake people remember on Monday.",
    cta: { href: "/collections/cakes", label: "Explore celebration cakes" },
  },
  signature: {
    heading: "Meet the one everyone comes back for.",
    fallbackSlug: "belgian-chocolate-truffle-cake",
  },
  occasions: {
    heading: "What’s the occasion?",
    items: [
      { slug: "birthday", label: "Birthday", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900" },
      { slug: "anniversary", label: "Anniversary", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900" },
      { slug: "congratulations", label: "Congratulations", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900" },
      { slug: "wedding", label: "Wedding", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900" },
      { slug: "baby-shower", label: "Baby shower", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=900" },
      { slug: "corporate-gifting", label: "Corporate gifting", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900" },
      { slug: "festive", label: "Festivals", image: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900" },
      { slug: "just-because", label: "Just because", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=900" },
    ],
  },
  story: {
    heading: "Good things happen when you don’t take baking too seriously.",
    body: "We started Clumsy Cheetah because the city deserved a bakery that could be a little messy and still get the ganache right. Come for the cake. Stay because it tasted like someone meant it.",
    cta: { href: "/about", label: "Our story" },
  },
  testimonials: [
    { name: "Rhea M.", product: "Truffle cake", quote: "That brownie lasted exactly 7 minutes in our house. The cake made it to dessert — barely." },
    { name: "Arjun P.", product: "Red velvet", quote: "Finally a red velvet that tastes like cocoa, not a science experiment." },
    { name: "Meera S.", product: "Cookie hamper", quote: "Sent this to a client. They asked for the bakery name before they said thank you." },
  ],
  social: {
    heading: "Spotted in the wild.",
    cta: { href: "https://instagram.com", label: "Follow along" },
  },
  newsletter: {
    heading: "Come for the cake.\nStay for the cravings.",
    note: "The odd drop, the odd joke. Unsubscribe whenever the diet starts.",
  },
  popularSearches: ["chocolate cake", "eggless", "brownies", "hamper", "tiramisu"],
  freeDeliveryThresholdPaise: 99900,
};

export const categoryHeroCopy: Record<string, { heading: string; body: string }> = {
  cakes: { heading: "Cakes worth celebrating.", body: "Layers, ganache, and the kind of finish that photographs well and eats better." },
  brownies: { heading: "Fudge, not filler.", body: "Crackly tops. Damp centres. Salt where it helps." },
  cheesecakes: { heading: "Set overnight. Worth it.", body: "Baked, chilled, and not pretending to be mousse." },
  cookies: { heading: "Thick on purpose.", body: "Boxes that do not survive the commute home." },
  pastries: { heading: "The afternoon case.", body: "Choux, tarts, and the éclair that never lasts." },
  desserts: { heading: "After-dinner, sorted.", body: "Cups, pies, and the tiramisu we soak — not drown." },
  "gift-hampers": { heading: "Gift like you meant it.", body: "Ribbon, a card, and nothing that feels leftover." },
  "best-sellers": { heading: "Everyone’s talking about these.", body: "The bakes the kitchen cannot keep." },
  "new-arrivals": { heading: "Just out of the oven.", body: "New, not noisy." },
};
