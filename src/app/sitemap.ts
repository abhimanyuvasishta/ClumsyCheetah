import type { MetadataRoute } from "next";
import { listCategories, listCollections, listProducts } from "@/lib/catalog/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [products, categories, collections] = await Promise.all([
    listProducts(),
    listCategories(),
    listCollections(),
  ]);

  const staticPaths = ["", "/shop", "/about", "/contact", "/faq", "/delivery", "/terms", "/privacy", "/refunds"];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: `${base}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ];
}
