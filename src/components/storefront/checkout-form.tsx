"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Price } from "@/components/storefront/price";
import { useCart } from "@/components/storefront/cart-provider";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { placeCheckoutOrder } from "@/lib/checkout/place-order";
import { buildUpiPayUrl, upiQrImageSrc } from "@/lib/checkout/upi";
import { saveAddress, type SavedAddress } from "@/app/(storefront)/account/addresses/actions";
import { previewCoupon, type CouponPreview } from "@/app/admin/offers/actions";
import { CartCoupon } from "@/components/storefront/cart-coupon";
import { readStoredCoupon, writeStoredCoupon } from "@/components/storefront/shop-commerce";

const steps = ["Contact", "Delivery", "Payment"] as const;

export type CheckoutAccount = {
  email: string;
  name: string;
  phone: string;
};

function deliveryFromAddress(a: SavedAddress, notes: string) {
  return {
    line1: a.line1,
    landmark: a.landmark ?? "",
    city: a.city,
    pincode: a.pincode,
    notes: notes || "",
  };
}

export function CheckoutForm({
  account,
  savedAddresses,
}: {
  account: CheckoutAccount | null;
  savedAddresses: SavedAddress[];
}) {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { pages } = useStorefrontConfig();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method] = useState<"UPI">("UPI");
  const [forMe, setForMe] = useState(Boolean(account));
  const [contact, setContact] = useState({
    name: account?.name ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
  });
  const [addressId, setAddressId] = useState(
    savedAddresses.find((a) => a.is_default)?.id ?? savedAddresses[0]?.id ?? "",
  );
  const [adding, setAdding] = useState(!account || savedAddresses.length === 0);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [delivery, setDelivery] = useState({
    line1: "",
    landmark: "",
    city: "Mumbai",
    pincode: "",
    notes: "",
  });
  const [savePending, setSavePending] = useState(false);
  const [gstin, setGstin] = useState("");
  const [couponQuote, setCouponQuote] = useState<CouponPreview | null>(null);

  useEffect(() => {
    async function load() {
      const code = readStoredCoupon();
      if (!code || !lines.length) {
        setCouponQuote(null);
        return;
      }
      const result = await previewCoupon(
        code,
        lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPaise: l.unitPricePaise })),
      );
      setCouponQuote(result);
    }
    void load();
    window.addEventListener("cc-coupon", load);
    return () => window.removeEventListener("cc-coupon", load);
  }, [lines]);

  const payable = Math.max(0, subtotal - (couponQuote && !couponQuote.error ? couponQuote.discountPaise ?? 0 : 0));

  useEffect(() => {
    const selected = addresses.find((a) => a.id === addressId);
    if (selected && !adding) {
      setDelivery((d) => deliveryFromAddress(selected, d.notes));
    }
  }, [addressId, adding, addresses]);

  const upiVpa = process.env.NEXT_PUBLIC_UPI_VPA ?? "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Clumsy Cheetah";
  const upiUrl = useMemo(
    () => buildUpiPayUrl({ vpa: upiVpa, payeeName, amountPaise: payable, note: "Clumsy Cheetah order" }),
    [upiVpa, payeeName, payable],
  );

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-heading text-3xl">{pages.checkout.emptyTitle}</h1>
        <Link href="/shop" className={cn(buttonVariants(), "mt-6 inline-flex rounded-full")}>
          {pages.checkout.emptyCta}
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
      couponCode: couponQuote && !couponQuote.error ? couponQuote.code : readStoredCoupon(),
      gstin,
    });
    setPending(false);
    if (result.error || !result.orderNumber) {
      setError(result.error ?? "Could not place the order");
      return;
    }
    clear();
    writeStoredCoupon("");
    router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber)}&pay=${method}`);
  }

  async function onAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!account) {
      setAdding(false);
      setStep(2);
      return;
    }
    setSavePending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await saveAddress({}, form);
    setSavePending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.address) {
      setAddresses((prev) => [result.address!, ...prev]);
      setAddressId(result.address.id);
      setDelivery(deliveryFromAddress(result.address, delivery.notes));
    }
    setAdding(false);
    setStep(2);
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
            {account ? (
              <div className="space-y-3">
                <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                  <input
                    type="radio"
                    name="who"
                    checked={forMe}
                    onChange={() => {
                      setForMe(true);
                      if (account) setContact({ name: account.name, email: account.email, phone: account.phone });
                    }}
                  />
                  For me ({account.name || account.email})
                </label>
                <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                  <input
                    type="radio"
                    name="who"
                    checked={!forMe}
                    onChange={() => {
                      setForMe(false);
                      setContact({ name: "", email: account.email, phone: "" });
                    }}
                  />
                  For someone else
                </label>
              </div>
            ) : null}
            {(!account || !forMe) && (
              <>
                <input required name="name" placeholder="Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
                <input required type="email" name="email" placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
                <input required name="phone" placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
              </>
            )}
            {account && forMe && !account.name ? (
              <input required name="name" placeholder="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            ) : null}
            {account && forMe && !account.phone ? (
              <input required name="phone" placeholder="Your phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-12 w-full rounded-xl border px-4" />
            ) : null}
            <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
              Continue to delivery
            </button>
          </form>
        ) : null}
        {step === 1 ? (
          <div className="space-y-4">
            <h1 className="font-heading text-3xl">Where should it go?</h1>
            {account && addresses.length > 0 && !adding ? (
              <>
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <label key={a.id} className="flex cursor-pointer gap-3 rounded-xl border px-4 py-3 text-sm">
                      <input
                        type="radio"
                        name="saved-address"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium">{a.label || "Address"}</span>
                        {a.is_default ? <span className="ml-2 text-xs text-muted-foreground">Default</span> : null}
                        <span className="mt-1 block text-muted-foreground">
                          {a.full_name}, {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.pincode}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <button type="button" className="text-sm underline" onClick={() => setAdding(true)}>
                  Add a new address
                </button>
                <textarea
                  placeholder="Delivery notes"
                  value={delivery.notes}
                  onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                  className="min-h-24 w-full rounded-xl border px-4 py-3"
                />
                <input
                  name="gstin"
                  placeholder="GSTIN (optional)"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="h-12 w-full rounded-xl border px-4"
                />
                <button
                  type="button"
                  className={cn(buttonVariants(), "h-12 w-full rounded-full")}
                  onClick={() => {
                    const selected = addresses.find((a) => a.id === addressId);
                    if (!selected) {
                      setError("Select an address");
                      return;
                    }
                    setDelivery(deliveryFromAddress(selected, delivery.notes));
                    setError(null);
                    setStep(2);
                  }}
                >
                  Continue to payment
                </button>
              </>
            ) : (
              <form className="space-y-4" onSubmit={onAddAddress}>
                {account ? (
                  <button type="button" className="text-sm underline" onClick={() => setAdding(false)}>
                    Use a saved address
                  </button>
                ) : null}
                {account ? (
                  <>
                    <input name="label" placeholder="Label (Home)" className="h-12 w-full rounded-xl border px-4" />
                    <input required name="full_name" placeholder="Name on doorbell" defaultValue={contact.name} className="h-12 w-full rounded-xl border px-4" />
                    <input required name="phone" placeholder="Phone" defaultValue={contact.phone} className="h-12 w-full rounded-xl border px-4" />
                  </>
                ) : null}
                <input
                  required
                  name="line1"
                  placeholder="Address line 1"
                  value={delivery.line1}
                  onChange={(e) => setDelivery({ ...delivery, line1: e.target.value })}
                  className="h-12 w-full rounded-xl border px-4"
                />
                <input
                  name="line2"
                  placeholder="Apartment / floor"
                  className="h-12 w-full rounded-xl border px-4"
                />
                <input
                  name="landmark"
                  placeholder="Landmark"
                  value={delivery.landmark}
                  onChange={(e) => setDelivery({ ...delivery, landmark: e.target.value })}
                  className="h-12 w-full rounded-xl border px-4"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    name="city"
                    placeholder="City"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="h-12 rounded-xl border px-4"
                  />
                  <input
                    required
                    name="pincode"
                    placeholder="Pincode"
                    value={delivery.pincode}
                    onChange={(e) => setDelivery({ ...delivery, pincode: e.target.value })}
                    className="h-12 rounded-xl border px-4"
                  />
                </div>
                {account ? <input type="hidden" name="state" value="Maharashtra" /> : null}
                <input
                  name="gstin"
                  placeholder="GSTIN (optional)"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="h-12 w-full rounded-xl border px-4"
                />
                <textarea
                  name="delivery_instructions"
                  placeholder="Delivery notes"
                  value={delivery.notes}
                  onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                  className="min-h-24 w-full rounded-xl border px-4 py-3"
                />
                {account ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="is_default" defaultChecked={!addresses.length} /> Save as default
                  </label>
                ) : null}
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")} disabled={savePending}>
                  {savePending ? "Saving…" : account ? "Save and continue" : "Continue to payment"}
                </button>
              </form>
            )}
          </div>
        ) : null}
        {step === 2 ? (
          <div>
            <h1 className="font-heading text-3xl">Payment</h1>
            <p className="mt-3 text-muted-foreground">Pay by UPI QR. We do not take cash on delivery.</p>
            <div className="mt-6 rounded-2xl border p-4 text-center">
              {upiUrl ? (
                <>
                  <img src={upiQrImageSrc(upiUrl)} alt="UPI payment QR" className="mx-auto h-52 w-52" />
                  <p className="mt-3 text-sm">
                    Scan with any UPI app. Amount <Price paise={payable} />
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{upiVpa}</p>
                  <a href={upiUrl} className="mt-3 inline-block text-sm underline">
                    Open UPI app
                  </a>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add <code>NEXT_PUBLIC_UPI_VPA</code> on Vercel so the QR can generate.
                </p>
              )}
            </div>
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
        <CartCoupon lines={lines} />
        <div className="mt-4 flex justify-between border-t pt-3 font-medium">
          <span>Total</span>
          <Price paise={payable} />
        </div>
        {couponQuote && !couponQuote.error ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {couponQuote.message}
            {couponQuote.giftName ? ` · gift: ${couponQuote.giftName}` : ""}
          </p>
        ) : null}
        <p className="mt-2 text-[11px] text-muted-foreground">Final total is calculated on the server from catalog prices.</p>
      </aside>
    </div>
  );
}
