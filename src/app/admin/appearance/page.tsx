import { AppearanceEditor } from "./appearance-editor";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Website appearance" };
export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const initial = await getStorefrontConfig();
  return <AppearanceEditor initial={initial} />;
}
