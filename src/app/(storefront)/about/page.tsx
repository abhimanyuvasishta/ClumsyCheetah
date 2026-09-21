export const metadata = { title: "Our story" };

export default function AboutPage() {
  return (
    <article className="store-wrap max-w-3xl py-16">
      <p className="eyebrow">Our story</p>
      <h1 className="mt-3 font-heading text-4xl md:text-5xl">Good things happen when you don’t take baking too seriously.</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Clumsy Cheetah started as a kitchen that wanted better ganache and a worse name. We bake in Bandra: laminated
        mornings, chocolate afternoons, and boxes that leave looking proud. The clumsiness is in the branding, not the
        crumb.
      </p>
    </article>
  );
}
