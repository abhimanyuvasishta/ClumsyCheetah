import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Contact" };

export default async function Page() {
  const { pages } = await getStorefrontConfig();
  return <StoreCopyPage heading={pages.contact.heading} body={pages.contact.body} />;
}
