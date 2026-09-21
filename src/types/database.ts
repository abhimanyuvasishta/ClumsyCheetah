/**
 * Domain types mirroring public schema.
 * After linking Supabase, prefer: npx supabase gen types typescript --project-id <id>
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DatabaseEnums = {
  app_role:
    | "CUSTOMER"
    | "ADMIN"
    | "ORDER_MANAGER"
    | "CATALOG_MANAGER"
    | "STORE_MANAGER"
    | "DELIVERY_MANAGER"
    | "SUPER_ADMIN";
  product_status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  order_status:
    | "PLACED"
    | "PAYMENT_CONFIRMED"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  payment_provider: "RAZORPAY" | "COD" | "MANUAL";
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: "ACTIVE" | "DISABLED";
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: DatabaseEnums["order_status"];
  total_paise: number;
};
