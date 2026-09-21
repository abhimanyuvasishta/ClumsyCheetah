-- Row Level Security. No policy = deny for that command.

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.locations enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.delivery_slots enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.collection_products enable row level security;
alter table public.product_tags enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usage enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.reviews enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.banners enable row level security;
alter table public.site_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Catalog / CMS public reads
create policy "public read locations" on public.locations for select using (is_active);
create policy "public read zones" on public.delivery_zones for select using (is_active);
create policy "public read slots" on public.delivery_slots for select using (is_active);
create policy "public read categories" on public.categories for select using (is_active and deleted_at is null);
create policy "public read collections" on public.collections for select using (is_active and deleted_at is null);
create policy "public read products" on public.products for select using (status = 'ACTIVE' and deleted_at is null);
create policy "staff read all products" on public.products for select using (public.is_staff());
create policy "public read variants" on public.product_variants for select using (
  status = 'ACTIVE' and deleted_at is null and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'ACTIVE' and p.deleted_at is null
  )
);
create policy "staff read all variants" on public.product_variants for select using (public.is_staff());
create policy "public read images" on public.product_images for select using (true);
create policy "public read product_categories" on public.product_categories for select using (true);
create policy "public read collection_products" on public.collection_products for select using (true);
create policy "public read product_tags" on public.product_tags for select using (true);
create policy "public read homepage" on public.homepage_sections for select using (is_visible);
create policy "public read banners" on public.banners for select using (
  is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
);
create policy "public read settings" on public.site_settings for select using (true);
create policy "public read published reviews" on public.reviews for select using (is_published);

-- Inventory: customers see availability via a view later; staff full. Public can read counts for PDP.
create policy "public read inventory" on public.inventory for select using (true);
create policy "staff read movements" on public.inventory_movements for select using (public.is_staff());

-- Coupons: validate via RPC later; hide inactive codes from anon listing
create policy "staff read coupons" on public.coupons for select using (public.is_staff());
create policy "staff read coupon usage" on public.coupon_usage for select using (public.is_staff());
create policy "customer read own coupon usage" on public.coupon_usage for select using (user_id = auth.uid());

-- Profiles
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "read own roles" on public.user_roles for select using (user_id = auth.uid() or public.is_staff());
create policy "admin write roles" on public.user_roles for all using (
  public.has_role('ADMIN') or public.has_role('SUPER_ADMIN')
);

create policy "own addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff read addresses" on public.addresses for select using (public.is_staff());

-- Carts
create policy "own carts" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own cart items" on public.cart_items for all using (
  exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
);

create policy "own wishlist" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist items" on public.wishlist_items for all using (
  exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
);

-- Orders: insert via service role / security definer in later phases. Customers read own.
create policy "customer read orders" on public.orders for select using (user_id = auth.uid());
create policy "staff read orders" on public.orders for select using (public.can_manage_orders());
create policy "staff update orders" on public.orders for update using (public.can_manage_orders());

create policy "customer read order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "staff read order items" on public.order_items for select using (public.can_manage_orders());

create policy "customer read order history" on public.order_status_history for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "staff order history" on public.order_status_history for all using (public.can_manage_orders());

create policy "customer read payments" on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "staff read payments" on public.payments for select using (public.can_manage_orders());
create policy "staff read refunds" on public.refunds for select using (public.can_manage_orders());

-- Catalog writes
create policy "catalog write categories" on public.categories for all using (public.can_manage_catalog());
create policy "catalog write collections" on public.collections for all using (public.can_manage_catalog());
create policy "catalog write products" on public.products for all using (public.can_manage_catalog());
create policy "catalog write variants" on public.product_variants for all using (public.can_manage_catalog());
create policy "catalog write images" on public.product_images for all using (public.can_manage_catalog());
create policy "catalog write product_categories" on public.product_categories for all using (public.can_manage_catalog());
create policy "catalog write collection_products" on public.collection_products for all using (public.can_manage_catalog());
create policy "catalog write product_tags" on public.product_tags for all using (public.can_manage_catalog());
create policy "catalog write inventory" on public.inventory for all using (public.can_manage_catalog() or public.can_manage_orders());
create policy "catalog write movements" on public.inventory_movements for all using (public.can_manage_catalog() or public.can_manage_orders());
create policy "staff write cms" on public.homepage_sections for all using (public.can_manage_catalog());
create policy "staff write banners" on public.banners for all using (public.can_manage_catalog());
create policy "admin write settings" on public.site_settings for all using (
  public.has_role('ADMIN') or public.has_role('SUPER_ADMIN') or public.can_manage_catalog()
);
create policy "staff write coupons" on public.coupons for all using (public.can_manage_catalog() or public.has_role('ADMIN'));
create policy "staff locations" on public.locations for all using (public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));
create policy "staff zones" on public.delivery_zones for all using (public.has_role('ADMIN') or public.has_role('SUPER_ADMIN') or public.has_role('STORE_MANAGER'));
create policy "staff slots" on public.delivery_slots for all using (public.has_role('ADMIN') or public.has_role('SUPER_ADMIN') or public.has_role('STORE_MANAGER'));

create policy "staff audit read" on public.audit_logs for select using (public.is_staff());
create policy "staff audit insert" on public.audit_logs for insert with check (public.is_staff());
create policy "staff notifications" on public.notifications for all using (public.is_staff());

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.has_role(public.app_role) to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.can_manage_catalog() to anon, authenticated;
grant execute on function public.can_manage_orders() to anon, authenticated;

-- Realtime (no-op if publication missing in some local setups)
do $$
begin
  alter publication supabase_realtime add table public.orders;
  alter publication supabase_realtime add table public.order_status_history;
  alter publication supabase_realtime add table public.inventory;
  alter publication supabase_realtime add table public.products;
exception when undefined_object then
  null;
when duplicate_object then
  null;
end;
$$;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images bucket"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "staff write product images bucket"
on storage.objects for all
using (bucket_id = 'product-images' and public.can_manage_catalog())
with check (bucket_id = 'product-images' and public.can_manage_catalog());
