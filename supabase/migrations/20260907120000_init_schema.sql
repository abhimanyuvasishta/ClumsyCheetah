-- Clumsy Cheetah core schema
-- Money is integer paise. Auth identity lives in auth.users.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums (future roles included)
-- ---------------------------------------------------------------------------

create type public.app_role as enum (
  'CUSTOMER',
  'ADMIN',
  'ORDER_MANAGER',
  'CATALOG_MANAGER',
  'STORE_MANAGER',
  'DELIVERY_MANAGER',
  'SUPER_ADMIN'
);

create type public.product_status as enum ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
create type public.variant_status as enum ('ACTIVE', 'INACTIVE');
create type public.profile_status as enum ('ACTIVE', 'DISABLED');

create type public.order_status as enum (
  'PLACED',
  'PAYMENT_CONFIRMED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
);

create type public.payment_status as enum (
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED',
  'PARTIAL_REFUND'
);

create type public.payment_provider as enum ('RAZORPAY', 'COD', 'MANUAL');
create type public.coupon_type as enum ('PERCENTAGE', 'FIXED', 'FREE_DELIVERY');
create type public.fulfillment_method as enum ('DELIVERY', 'PICKUP');

create type public.inventory_movement_type as enum (
  'RECEIPT',
  'SALE',
  'RESERVE',
  'RELEASE',
  'ADJUSTMENT',
  'RETURN',
  'WASTE'
);

create type public.banner_placement as enum ('HERO', 'PROMO', 'MID', 'FOOTER');
create type public.notification_channel as enum ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP');
create type public.notification_status as enum ('PENDING', 'SENT', 'FAILED');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  status public.profile_status not null default 'ACTIVE',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, role)
);

create or replace function public.has_role(check_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = check_role
      and ur.revoked_at is null
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.revoked_at is null
      and ur.role in (
        'ADMIN',
        'SUPER_ADMIN',
        'ORDER_MANAGER',
        'CATALOG_MANAGER',
        'STORE_MANAGER',
        'DELIVERY_MANAGER'
      )
  );
$$;

create or replace function public.can_manage_catalog()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('ADMIN')
      or public.has_role('SUPER_ADMIN')
      or public.has_role('CATALOG_MANAGER');
$$;

create or replace function public.can_manage_orders()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('ADMIN')
      or public.has_role('SUPER_ADMIN')
      or public.has_role('ORDER_MANAGER')
      or public.has_role('STORE_MANAGER');
$$;

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'IN',
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index addresses_user_id_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Locations & delivery
-- ---------------------------------------------------------------------------

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  email text,
  line1 text,
  city text,
  state text,
  pincode text,
  is_active boolean not null default true,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  name text not null,
  pincode text not null,
  delivery_fee_paise integer not null default 0 check (delivery_fee_paise >= 0),
  min_order_paise integer not null default 0 check (min_order_paise >= 0),
  free_delivery_threshold_paise integer,
  lead_time_hours integer not null default 2 check (lead_time_hours >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, pincode)
);

create table public.delivery_slots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  label text not null,
  starts_at time not null,
  ends_at time not null,
  capacity integer not null default 20 check (capacity >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  collection_type text not null default 'MERCHANDISING',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  long_description text,
  primary_category_id uuid references public.categories (id),
  tags text[] not null default '{}',
  thumbnail_url text,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_vegetarian boolean not null default true,
  is_eggless boolean not null default true,
  contains_egg boolean not null default false,
  allergen_info text,
  ingredients text,
  serving_size text,
  weight_label text,
  preparation_time_hours integer,
  shelf_life text,
  storage_instructions text,
  tax_rate_bps integer not null default 1800 check (tax_rate_bps >= 0),
  hsn_code text,
  status public.product_status not null default 'DRAFT',
  available_location_ids uuid[] not null default '{}',
  available_methods public.fulfillment_method[] not null default '{DELIVERY}',
  seo_title text,
  seo_description text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  archived_at timestamptz
);

create index products_status_idx on public.products (status) where deleted_at is null;
create index products_primary_category_idx on public.products (primary_category_id);
create index products_search_idx on public.products using gin (search_vector);
create index products_tags_idx on public.products using gin (tags);
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  name text not null,
  flavour text,
  weight_grams integer,
  weight_label text,
  price_paise integer not null check (price_paise >= 0),
  compare_at_paise integer check (compare_at_paise is null or compare_at_paise >= 0),
  status public.variant_status not null default 'ACTIVE',
  unlimited_inventory boolean not null default false,
  low_stock_threshold integer not null default 5,
  min_order_qty integer not null default 1 check (min_order_qty >= 1),
  max_order_qty integer check (max_order_qty is null or max_order_qty >= 1),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index product_variants_product_id_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.product_categories (
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);

create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag text not null,
  primary key (product_id, tag)
);

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  unique (location_id, variant_id),
  check (reserved <= on_hand),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory (id) on delete cascade,
  movement_type public.inventory_movement_type not null,
  quantity integer not null,
  reason text,
  order_id uuid,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cart / wishlist
-- ---------------------------------------------------------------------------

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  session_id text unique,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id),
  quantity integer not null check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id, saved_for_later)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  coupon_type public.coupon_type not null,
  percent_off numeric(5, 2),
  amount_off_paise integer,
  min_order_paise integer not null default 0,
  max_discount_paise integer,
  usage_limit integer,
  usage_per_customer integer not null default 1,
  applicable_category_ids uuid[] not null default '{}',
  applicable_product_ids uuid[] not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id),
  user_id uuid references public.profiles (id),
  order_id uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders & payments
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id),
  location_id uuid references public.locations (id),
  status public.order_status not null default 'PLACED',
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  shipping_address jsonb not null default '{}',
  delivery_date date,
  delivery_slot_id uuid references public.delivery_slots (id),
  delivery_slot_label text,
  fulfillment_method public.fulfillment_method not null default 'DELIVERY',
  customer_notes text,
  gift_message text,
  is_gift boolean not null default false,
  staff_notes text,
  subtotal_paise integer not null default 0,
  discount_paise integer not null default 0,
  tax_paise integer not null default 0,
  delivery_fee_paise integer not null default 0,
  total_paise integer not null default 0,
  coupon_code text,
  channel text not null default 'WEB',
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index orders_user_id_idx on public.orders (user_id, placed_at desc);
create index orders_status_idx on public.orders (status, placed_at desc);
create index orders_location_idx on public.orders (location_id, placed_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  variant_id uuid references public.product_variants (id),
  product_name text not null,
  variant_name text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price_paise integer not null,
  tax_paise integer not null default 0,
  line_total_paise integer not null,
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  note text,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider public.payment_provider not null,
  status public.payment_status not null default 'PENDING',
  amount_paise integer not null,
  currency text not null default 'INR',
  provider_order_id text,
  provider_payment_id text,
  provider_reference text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  amount_paise integer not null check (amount_paise > 0),
  reason text,
  provider_refund_id text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.inventory_movements
  add constraint inventory_movements_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete set null;

alter table public.coupon_usage
  add constraint coupon_usage_order_id_fkey
  foreign key (order_id) references public.orders (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Reviews, CMS, notifications, audit
-- ---------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references public.profiles (id),
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text,
  subtitle text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  image_url text not null,
  placement public.banner_placement not null default 'HERO',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  channel public.notification_channel not null,
  template_key text not null,
  recipient text not null,
  payload jsonb not null default '{}',
  status public.notification_status not null default 'PENDING',
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  resource_type text not null,
  resource_id text,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_resource_idx on public.audit_logs (resource_type, resource_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Search vector + profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.products_search_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(new.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.short_description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.long_description, '')), 'D');
  return new;
end;
$$;

create trigger products_search_vector
before insert or update of name, tags, short_description, long_description
on public.products
for each row execute function public.products_search_update();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.phone
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'CUSTOMER')
  on conflict (user_id, role) do nothing;
  insert into public.wishlists (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at triggers
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','addresses','locations','delivery_zones','delivery_slots',
    'categories','collections','products','product_variants','inventory',
    'carts','cart_items','coupons','orders','payments','homepage_sections',
    'banners','site_settings'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;
