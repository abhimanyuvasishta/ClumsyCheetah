"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { exclusiveOfGst } from "@/lib/money";
import { liveOffersForProduct, type OfferProductHint, type OfferRow } from "@/lib/offers/types";

const GST_KEY = "cc-gst-mode";
const COUPON_KEY = "cc-offer-code";

type GstMode = "incl" | "excl";

const OffersCtx = createContext<OfferRow[]>([]);
const GstCtx = createContext<{ mode: GstMode; setMode: (m: GstMode) => void }>({
  mode: "incl",
  setMode: () => {},
});

export function ShopCommerceProvider({ offers, children }: { offers: OfferRow[]; children: ReactNode }) {
  const [mode, setModeState] = useState<GstMode>("incl");
  useEffect(() => {
    const stored = window.localStorage.getItem(GST_KEY);
    if (stored === "excl" || stored === "incl") setModeState(stored);
  }, []);
  const setMode = (next: GstMode) => {
    setModeState(next);
    window.localStorage.setItem(GST_KEY, next);
  };
  const gst = useMemo(() => ({ mode, setMode }), [mode]);
  return (
    <OffersCtx.Provider value={offers}>
      <GstCtx.Provider value={gst}>{children}</GstCtx.Provider>
    </OffersCtx.Provider>
  );
}

export function useLiveOffers() {
  return useContext(OffersCtx);
}

export function useProductOffers(product: OfferProductHint) {
  const offers = useLiveOffers();
  return liveOffersForProduct(offers, product);
}

export function useGstMode() {
  return useContext(GstCtx);
}

export function displayPaise(inclusivePaise: number, mode: GstMode) {
  return mode === "excl" ? exclusiveOfGst(inclusivePaise) : inclusivePaise;
}

export function readStoredCoupon(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(COUPON_KEY) ?? "";
}

export function writeStoredCoupon(code: string) {
  if (!code) window.localStorage.removeItem(COUPON_KEY);
  else window.localStorage.setItem(COUPON_KEY, code);
  window.dispatchEvent(new Event("cc-coupon"));
}
