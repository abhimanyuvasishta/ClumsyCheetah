import Link from "next/link";
import { NewOrderForm } from "@/components/admin/new-order-form";
import { listSellableVariants } from "@/lib/admin/orders";

export default async function NewOrderPage() {
  const rows = await listSellableVariants();
  const variants = rows.map((r) => {
    const product = r.products as { name?: string } | null;
    return {
      id: r.id as string,
      sku: r.sku as string,
      name: r.name as string,
      price_paise: r.price_paise as number,
      productName: product?.name ?? "Product",
    };
  });
  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
        ← Orders
      </Link>
      <h1 className="mt-2 text-xl font-semibold">New order</h1>
      <p className="mt-1 text-sm text-muted-foreground">Line total is computed from the variant’s server price.</p>
      <div className="mt-6">
        <NewOrderForm variants={variants} />
      </div>
    </div>
  );
}
