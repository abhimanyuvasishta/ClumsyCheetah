-- Kitchen note shown on the customer order countdown.

alter table public.orders
  add column if not exists eta_message text;

comment on column public.orders.eta_message is 'Staff message shown with the customer countdown on My order.';
