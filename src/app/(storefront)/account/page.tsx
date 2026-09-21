import Link from "next/link";
import { cn } from "@/lib/utils";

const steps = ["Placed", "Confirmed", "Baking", "Ready", "Out for delivery", "Delivered"] as const;

export function OrderTimeline({ current = 2 }: { current?: number }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <span className={cn("size-2.5 rounded-full", i <= current ? "bg-caramel" : "bg-border")} />
          <span className={i <= current ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function AccountPage() {
  return (
    <div className="store-wrap py-12">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 font-heading text-4xl">Hello, you.</h1>
      <p className="mt-2 text-muted-foreground">Sign in to attach this bag to a real profile. For now, here’s the house.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["/account", "Orders"],
          ["/account", "Addresses"],
          ["/wishlist", "Wishlist"],
          ["/login", "Profile"],
        ].map(([href, label]) => (
          <Link key={label} href={href} className="rounded-[1.05rem] border bg-surface px-4 py-5 font-heading text-xl">
            {label}
          </Link>
        ))}
      </div>
      <section className="mt-12 rounded-[1.15rem] border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Latest order</p>
            <p className="font-heading text-2xl">When you place one, it lives here.</p>
            <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs">Awaiting first bake</span>
          </div>
          <OrderTimeline current={-1} />
        </div>
      </section>
    </div>
  );
}
