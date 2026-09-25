-- Offers merchandising, redemptions, optional GSTIN on orders.
-- Paste in Supabase SQL editor after the init migrations.

create type public.offer_kind as enum ('PERCENTAGE', 'FIXED', 'FREE_DELIVERY', 'FREE_GIFT');

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  kind public.offer_kind not null,
  coupon_code text unique,
  percent_off numeric(5, 2),
  amount_off_paise integer,
  min_order_paise integer not null default 0,
  max_discount_paise integer,
  gift_product_id uuid references public.products (id),
  applicable_product_ids uuid[] not null default '{}',
  applicable_category_ids uuid[] not null default '{}',
  filter_eggless boolean not null default false,
  filter_vegetarian boolean not null default false,
  filter_bestseller boolean not null default false,
  filter_new_arrival boolean not null default false,
  banner_text text,
  show_banner boolean not null default true,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  usage_limit integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists offers_window_idx on public.offers (is_active, starts_at, ends_at);
create index if not exists offers_code_idx on public.offers (coupon_code) where coupon_code is not null;

create table if not exists public.offer_redemptions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references public.profiles (id),
  discount_paise integer not null default 0,
  gift_product_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists offer_redemptions_offer_idx on public.offer_redemptions (offer_id, created_at desc);

alter table public.orders add column if not exists gstin text;

alter table public.offers enable row level security;
alter table public.offer_redemptions enable row level security;

drop policy if exists "public read live offers" on public.offers;
create policy "public read live offers" on public.offers for select using (
  is_active and starts_at <= now() and ends_at >= now()
);

drop policy if exists "staff read offers" on public.offers;
create policy "staff read offers" on public.offers for select using (public.is_staff());

drop policy if exists "staff write offers" on public.offers;
create policy "staff write offers" on public.offers for all using (
  public.can_manage_catalog() or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN')
);

drop policy if exists "staff read redemptions" on public.offer_redemptions;
create policy "staff read redemptions" on public.offer_redemptions for select using (public.is_staff());

drop policy if exists "staff write redemptions" on public.offer_redemptions;
create policy "staff write redemptions" on public.offer_redemptions for all using (
  public.can_manage_orders() or public.can_manage_catalog() or public.has_role('ADMIN')
);

grant select on public.offers to anon, authenticated;
grant select, insert, update, delete on public.offers to authenticated;
grant select on public.offer_redemptions to authenticated;
grant insert on public.offer_redemptions to authenticated;
grant usage on type public.offer_kind to anon, authenticated;
