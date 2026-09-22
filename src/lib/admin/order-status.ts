import type { DatabaseEnums } from "@/types/database";

export const ORDER_STATUS_NEXT: Partial<Record<DatabaseEnums["order_status"], DatabaseEnums["order_status"][]>> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  PAYMENT_CONFIRMED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function allowedNextStatuses(status: DatabaseEnums["order_status"]) {
  return ORDER_STATUS_NEXT[status] ?? [];
}
