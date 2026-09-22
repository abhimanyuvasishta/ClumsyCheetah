import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Delivery" };

export default async function Page() {
  const { pages } = await getStorefrontConfig();
  return <StoreCopyPage heading={pages.delivery.heading} body={pages.delivery.body} />;
}
