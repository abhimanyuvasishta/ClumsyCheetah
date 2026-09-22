import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "FAQ" };

export default async function Page() {
  const { pages } = await getStorefrontConfig();
  return <StoreCopyPage heading={pages.faq.heading} body={pages.faq.body} />;
}
