# Clumsy Cheetah — Database

PostgreSQL on Supabase. UUIDs as primary keys. Soft-delete (`deleted_at` / `archived_at`) on catalog and customers where recovery matters. `created_at` / `updated_at` on mutable tables.

Migrations: `supabase/migrations/`. Seed: `supabase/seed.sql`.

## Entity groups

```
auth.users 1—1 profiles 1—* user_roles
profiles 1—* addresses
profiles 1—* carts 1—* cart_items → product_variants
profiles 1—* wishlists 1—* wishlist_items → products

categories (tree) *—* products *—* collections
products 1—* product_variants 1—* inventory → locations
products 1—* product_images
products *—* tags via product_tags

orders 1—* order_items
orders 1—* order_status_history
orders 1—* payments 1—* refunds
orders *—* coupon_usage → coupons

delivery_zones 1—* delivery_slots (per location)

homepage_sections, banners, site_settings
notifications, audit_logs, reviews
```

## Catalog

- `products` — merchandising, SEO, diet flags, GST (`tax_rate_bps`, `hsn_code`), prep/shelf/storage.
- `product_variants` — SKU, price_paise, compare_at_paise, weight_grams, flavour, status, min/max qty, unlimited_inventory.
- `product_images` — `sort_order`, `is_primary`, storage path or URL.
- `categories.parent_id` — cakes → flavour subcategories later.
- `collections` — bestsellers, occasions, gifting. `collection_products.sort_order`.

## Inventory

| Column | Meaning |
| --- | --- |
| `on_hand` | Physical count |
| `reserved` | Held for confirmed unpaid/preparing orders |
| available | `on_hand - reserved` (constraint: reserved ≤ on_hand) |

`inventory_movements` records every change (sale, reserve, receipt, adjustment).

## Orders

Statuses match customer-facing copy:

`PLACED` → `PAYMENT_CONFIRMED` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`, plus `CANCELLED`, `REFUNDED`.

Every transition inserts `order_status_history`. Line items snapshot name, SKU, unit price, tax — historical invoices do not follow later price edits.

## RLS summary

| Who | Read | Write |
| --- | --- | --- |
| Anon | Active catalog, CMS, zones | None (except insert into waitlists later) |
| Customer | Own profile, addresses, carts, orders | Own profile, addresses, cart, wishlist |
| CATALOG_MANAGER | Staff catalog | Products, inventory, CMS |
| ORDER_MANAGER | Orders, customers (limited) | Order status, notes |
| ADMIN / SUPER_ADMIN | All | All staff operations |

Service role bypasses RLS and is **server-only** (webhooks, seed, cron).

## Indexes (high traffic)

- Unique slugs: products, categories, collections, coupons.code
- Unique SKU on variants
- `orders (status, placed_at desc)`, `orders (user_id, placed_at desc)`
- `inventory (location_id, variant_id)` unique
- Full-text: `products.search_vector` (name, description, tags) — GIN

## Apply locally

1. Create a Supabase project.
2. `supabase link` then `supabase db push`, or paste migrations in the SQL editor in order.
3. Run `supabase/seed.sql`.
4. Create the first admin: sign up via the app, then insert `user_roles (user_id, role)` = `ADMIN`.

## BigQuery warehouse

The same entities exist as tables in Google BigQuery dataset `commerce` (Mumbai: `asia-south1`), provisioned for `anita.sharma@clumsycheetah.in`. See [docs/BIGQUERY.md](BIGQUERY.md). Live checkout still uses Postgres.

