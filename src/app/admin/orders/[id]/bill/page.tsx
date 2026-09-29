import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderBill } from "@/components/admin/order-bill";
import { PrintBillBar } from "@/components/admin/print-bill-bar";
import { getAdminOrder } from "@/lib/admin/orders";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function OrderBillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const supabase = await createServerSupabaseClient();
  const { data: kitchen } = supabase
    ? await supabase
        .from("locations")
        .select("name, phone, email, line1, city, state, pincode")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/admin/orders/${order.id}`} className="text-xs text-muted-foreground hover:underline">
          ← {order.order_number}
        </Link>
        <Link href={`/admin/orders/${order.id}/bill?print=1`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Print now
        </Link>
      </div>
      <PrintBillBar autoPrint={print === "1"} />
      <OrderBill order={order} kitchen={kitchen} />
    </div>
  );
}
