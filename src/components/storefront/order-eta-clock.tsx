"use client";

import { useEffect, useState } from "react";
import { formatIst } from "@/lib/time";

function partsFromMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { hours, minutes, seconds, done: total <= 0 };
}

export function OrderEtaClock({
  promisedAt,
  status,
}: {
  promisedAt: string | null;
  status: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (status === "DELIVERED") {
    return <p className="mt-4 text-sm">This order has arrived. Enjoy.</p>;
  }
  if (status === "CANCELLED" || status === "REFUNDED") {
    return <p className="mt-4 text-sm text-muted-foreground">This order is no longer on the way.</p>;
  }
  if (!promisedAt) {
    return <p className="mt-4 text-sm text-muted-foreground">Kitchen timing will show here once we confirm the order.</p>;
  }

  const { hours, minutes, seconds, done } = partsFromMs(new Date(promisedAt).getTime() - now);

  return (
    <div className="mt-6 rounded-2xl border bg-secondary/40 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estimated ready / delivery</p>
      {done ? (
        <p className="mt-2 font-heading text-2xl">Any moment now</p>
      ) : (
        <p className="mt-2 font-heading text-3xl tabular-nums">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {formatIst(promisedAt)} · kitchen may move this later or earlier
      </p>
    </div>
  );
}
