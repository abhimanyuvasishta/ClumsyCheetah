export function StoreCopyPage({
  eyebrow,
  heading,
  body,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
}) {
  return (
    <article className="store-wrap max-w-3xl py-16">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className={eyebrow ? "mt-3 font-heading text-4xl md:text-5xl" : "font-heading text-4xl md:text-5xl"}>{heading}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}
