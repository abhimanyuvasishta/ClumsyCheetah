"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Price } from "@/components/storefront/price";
import { useCart } from "@/components/storefront/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { placeCheckoutOrder } from "@/lib/checkout/place-order";
import { buildUpiPayUrl, upiQrImageSrc } from "@/lib/checkout/upi";

const steps = ["Contact", "Delivery", "Payment"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"UPI" | "COD">("UPI");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [delivery, setDelivery] = useState({
    line1: "",
    landmark: "",
    city: "Mumbai",
    pincode: "",
    notes: "",
  });

  const upiVpa = process.env.NEXT_PUBLIC_UPI_VPA ?? "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Clumsy Cheetah";
  const upiUrl = useMemo(
    () => buildUpiPayUrl({ vpa: upiVpa, payeeName, amountPaise: subtotal, note: "Clumsy Cheetah order" }),
    [upiVpa, payeeName, subtotal],
  );

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-heading text-3xl">Nothing to check out yet.</h1>
        <Link href="/shop" className={cn(buttonVariants(), "mt-6 inline-flex rounded-full")}>
          Shop the good stuff
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setPending(true);
    setError(null);
    const result = await placeCheckoutOrder({
      ...contact,
      ...delivery,
      method,
      lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    });
    setPending(false);
    if (result.error || !result.orderNumber) {
      setError(result.error ?? "Could not place the order");
      return;
    }
    clear();
    router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}&pay=${method}`);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[1fr_18rem]">
      <div>
        <ol className="mb-8 flex gap-4 text-sm">
          {steps.map((label, i) => (
            <li key={label} className={i === step ? "font-medium" : "text-muted-foreground"}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>
        {step === 0 ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <h1 className="font-heading text-3xl">Who’s receiving this?</h1>
            <input required name="name" placeholder="Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            <input required type="email" name="email" placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            <input required name="phone" placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
              Continue to delivery
            </button>
          </form>
        ) : null}
        {step === 1 ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <h1 className="font-heading text-3xl">Where should it go?</h1>
            <input required placeholder="Address line 1" value={delivery.line1} onChange={(e) => setDelivery({ ...delivery, line1: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            <input placeholder="Landmark" value={delivery.landmark} onChange={(e) => setDelivery({ ...delivery, landmark: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="City" value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} className="h-12 rounded-xl border px-4" />
              <input required placeholder="Pincode" value={delivery.pincode} onChange={(e) => setDelivery({ ...delivery, pincode: e.target.value })} className="h-12 rounded-xl border px-4" />
            </div>
            <textarea placeholder="Delivery notes" value={delivery.notes} onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })} className="min-h-24 w-full rounded-xl border px-4 py-3" />
            <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
              Continue to payment
            </button>
          </form>
        ) : null}
        {step === 2 ? (
          <div>
            <h1 className="font-heading text-3xl">Payment</h1>
            <p className="mt-3 text-muted-foreground">No cards on this site. Pay by UPI QR or cash when it arrives.</p>
            <div className="mt-6 space-y-3">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                <input type="radio" name="pay" checked={method === "UPI"} onChange={() => setMethod("UPI")} />
                UPI QR
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                <input type="radio" name="pay" checked={method === "COD"} onChange={() => setMethod("COD")} />
                Cash on delivery
              </label>
            </div>
            {method === "UPI" ? (
              <div className="mt-6 rounded-2xl border p-4 text-center">
                {upiUrl ? (
                  <>
                    <img src={upiQrImageSrc(upiUrl)} alt="UPI payment QR" className="mx-auto h-52 w-52" />
                    <p className="mt-3 text-sm">
                      Scan with any UPI app. Amount <Price paise={subtotal} />
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{upiVpa}</p>
                    <a href={upiUrl} className="mt-3 inline-block text-sm underline">
                      Open UPI app
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add <code>NEXT_PUBLIC_UPI_VPA</code> on Vercel (e.g. bakery@okaxis) so the QR can generate. You can still place the order and pay COD, or set the VPA and redeploy.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Pay cash to the rider. The kitchen will see this as COD.</p>
            )}
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            <button type="button" className={cn(buttonVariants(), "mt-6 h-12 w-full rounded-full")} disabled={pending} onClick={placeOrder}>
              {pending ? "Placing order…" : "Place order"}
            </button>
          </div>
        ) : null}
      </div>
      <aside className="h-fit rounded-[1.1rem] border p-4">
        <p className="font-medium">Your bakes</p>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-2">
              <span>
                {l.name} × {l.quantity}
              </span>
              <Price paise={l.unitPricePaise * l.quantity} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 font-medium">
          <span>Total</span>
          <Price paise={subtotal} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Final total is calculated on the server from catalog prices.</p>
      </aside>
    </div>
  );
}
