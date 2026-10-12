import { adjustOrderEta } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { formatIst } from "@/lib/time";

export function OrderEtaControls({ orderId, promisedAt }: { orderId: string; promisedAt: string | null }) {
  return (
    <div className="rounded-lg border bg-white p-4">
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
          <form key={String(mins)} action={adjustOrderEta.bind(null, orderId, mins as number)}>
            <Button type="submit" size="sm" variant="outline">
              {label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
