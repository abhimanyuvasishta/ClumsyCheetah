import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order placed" };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; pay?: string }>;
}) {
  const { order, pay } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="eyebrow">Thank you</p>
      <h1 className="mt-2 font-heading text-4xl">It’s in the kitchen.</h1>
      {order ? <p className="mt-3 font-mono text-sm">{order}</p> : null}
      <p className="mt-4 text-muted-foreground">
        {pay === "COD"
          ? "Pay cash when it arrives."
          : "If you chose UPI, complete the scan if you haven’t already. We’ll confirm the transfer."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className={cn(buttonVariants(), "rounded-full")}>
          Your orders
        </Link>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
