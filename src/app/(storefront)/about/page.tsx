import { StoreCopyPage } from "@/components/storefront/store-copy-page";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata = { title: "Our story" };

export default async function AboutPage() {
  const { pages, aboutBlocks } = await getStorefrontConfig();
  return (
    <div>
      <StoreCopyPage eyebrow={pages.about.eyebrow} heading={pages.about.heading} body={pages.about.body} />
      {aboutBlocks.length ? (
        <div className="store-wrap max-w-3xl space-y-10 pb-16">
          {aboutBlocks.map((block) => (
            <section key={block.heading}>
              <h2 className="font-heading text-2xl">{block.heading}</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{block.body}</p>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
