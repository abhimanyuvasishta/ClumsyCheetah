-- Prep/delivery estimates on products and a live promised time on orders.

alter table public.products
  add column if not exists delivery_time_hours integer;

alter table public.orders
  add column if not exists promised_at timestamptz;

comment on column public.products.delivery_time_hours is 'Estimated hours from kitchen-ready to delivered.';
comment on column public.orders.promised_at is 'Customer-facing ready/delivery time. Staff can move this later or earlier.';
