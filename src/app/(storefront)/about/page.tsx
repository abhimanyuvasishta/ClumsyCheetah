import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Our story" };

export default async function AboutPage() {
  const { pages } = await getStorefrontConfig();
  return <StoreCopyPage eyebrow={pages.about.eyebrow} heading={pages.about.heading} body={pages.about.body} />;
}
