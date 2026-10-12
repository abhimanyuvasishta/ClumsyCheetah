import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "FAQ" };

export default async function Page() {
  const { pages, faqs } = await getStorefrontConfig();
  return (
    <div>
      <StoreCopyPage heading={pages.faq.heading} body={pages.faq.body} />
      {faqs.length ? (
        <div className="store-wrap max-w-3xl space-y-4 pb-16">
          {faqs.map((item) => (
            <details key={item.question} className="rounded-2xl border bg-surface p-4">
              <summary className="cursor-pointer font-medium">{item.question}</summary>
              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}
