-- Product feedback after delivery. Paste in Supabase SQL editor.

alter table public.reviews add column if not exists order_id uuid references public.orders (id) on delete set null;

create unique index if not exists reviews_order_product_uidx
  on public.reviews (order_id, product_id)
  where order_id is not null;

drop policy if exists "customer read own reviews" on public.reviews;
create policy "customer read own reviews" on public.reviews
  for select using (user_id = auth.uid());

drop policy if exists "staff read reviews" on public.reviews;
create policy "staff read reviews" on public.reviews
  for select using (public.is_staff());

drop policy if exists "customer insert review after delivery" on public.reviews;
create policy "customer insert review after delivery" on public.reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and order_id is not null
    and exists (
      select 1
      from public.orders o
      join public.order_items i on i.order_id = o.id
      where o.id = reviews.order_id
        and o.user_id = auth.uid()
        and o.status = 'DELIVERED'
        and i.product_id = reviews.product_id
    )
  );

grant select, insert on public.reviews to authenticated;
grant select on public.reviews to anon;
