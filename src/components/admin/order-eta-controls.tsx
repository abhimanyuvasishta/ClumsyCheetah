import { updateOrderEta } from "@/app/admin/orders/actions";
import { buttonVariants } from "@/components/ui/button";
import { formatIst } from "@/lib/time";
import { cn } from "@/lib/utils";

export function OrderEtaControls({
  orderId,
  promisedAt,
  etaMessage,
  slots,
}: {
  orderId: string;
  promisedAt: string | null;
  etaMessage: string | null;
  slots: { value: string; label: string }[];
}) {
  const selected =
    slots.find((slot) => promisedAt && new Date(slot.value).getTime() === new Date(promisedAt).getTime())?.value ?? "";

  return (
    <form action={updateOrderEta.bind(null, orderId)} className="rounded-lg border bg-white p-4">
      <h2 className="text-sm font-medium">Customer countdown</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {promisedAt ? `Currently ${formatIst(promisedAt)}` : "No time set yet. Add time to start the clock on My order."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          [-60, "−1 hour"],
          [-30, "−30 min"],
          [30, "+30 min"],
          [60, "+1 hour"],
        ].map(([mins, label]) => (
          <button
            key={String(mins)}
            type="submit"
            name="delta_minutes"
            value={String(mins)}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        Set time
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <select
            name="promised_at"
            defaultValue={selected}
            className="h-9 min-w-[16rem] flex-1 rounded-lg border bg-white px-2 text-sm"
          >
            <option value="">Choose a 15 min slot</option>
            {slots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          <button type="submit" name="intent" value="set" className={cn(buttonVariants({ size: "sm" }))}>
            Set time
          </button>
        </span>
      </label>
      <label className="mt-4 block text-sm">
        Message on My order
        <textarea
          name="eta_message"
          defaultValue={etaMessage ?? ""}
          rows={3}
          maxLength={400}
          placeholder="Shown with the countdown, including when you add or take time."
          className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
        />
      </label>
      <p className="mt-1 text-xs text-muted-foreground">Saved with ± time, Set time, or Save message.</p>
      <button type="submit" name="intent" value="message" className={cn(buttonVariants({ size: "sm" }), "mt-2")}>
        Save message
      </button>
    </form>
  );
}
