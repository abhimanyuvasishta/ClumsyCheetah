export const metadata = { title: "Refunds" };
export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-4xl">Refund &amp; cancellation</h1>
      <p className="mt-4 text-muted-foreground">Cancellations depend on prep status. Refunds flow through the payment provider in Phase 8.</p>
    </article>
  );
}
