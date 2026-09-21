# Clumsy Cheetah — Architecture

Premium D2C bakery commerce: one Next.js application, one Supabase project, three interfaces.

| Interface | Route surface | UX |
| --- | --- | --- |
| Customer storefront | `/`, `/shop`, `/products/*`, `/collections/*`, account, cart | Emotional, visual, bakery-led |
| Admin / vendor | `/admin` | Catalog, CMS, customers, coupons, inventory |
| Order management | `/admin/orders` | Ops-dense, realtime, status machine |

Staff portals share the admin chrome and RBAC. They are not a separate deploy.

## Why a single Next.js app

- One Vercel project and one cookie domain for Auth.
- Shared TypeScript domain (catalog, cart, orders, payments).
- Distinct **route groups / layouts** so storefront and admin never share visual systems.
- Split into `apps/web` + `apps/admin` later without rewriting Postgres or services.

## System topology

```
Browser (storefront | admin)
        │  RSC + Server Actions + Route Handlers
        ▼
Next.js (Vercel)
        │  @supabase/ssr (anon + user JWT)
        │  service role: server jobs / webhooks only
        ▼
Supabase
  Postgres + RLS
  Auth (email, Google, phone OTP later)
  Realtime
  Storage (product images)
```

Payments (Phase 8): Razorpay Checkout + COD. The app talks to a `PaymentProvider` port. Card PAN is never stored.

## Layering

| Layer | Location | Responsibility |
| --- | --- | --- |
| UI | `src/components/storefront`, `src/components/admin`, `src/components/ui` | Presentation only |
| App routes | `src/app` | Composition, metadata, auth gates |
| Validation | `src/lib/validation` | Zod at every mutation boundary |
| Domain services | `src/lib/catalog`, `cart`, `orders`, `payments`, `notifications` | Business rules |
| Data access | `src/lib/db` | Supabase queries, no UI |
| AuthZ | `src/lib/auth` + RLS | Roles on server and database |

Prices, tax, coupons, and delivery fees are **never** accepted from the client. Checkout sends variant IDs and quantities; the server recomputes.

## Auth and RBAC

Supabase Auth owns identity. `public.profiles` extends `auth.users`. `public.user_roles` is many-to-one (a user may hold multiple roles).

Launch roles: `CUSTOMER`, `ADMIN`, `ORDER_MANAGER`, `CATALOG_MANAGER`.

Reserved: `STORE_MANAGER`, `DELIVERY_MANAGER`, `SUPER_ADMIN`.

Enforcement:

1. RLS policies using `has_role()` / `is_staff()`.
2. Next.js layouts and Server Actions re-check roles (defense in depth).
3. UI hiding is cosmetic only.

There is no demo/fake login. Unconfigured env vars simply mean Auth cannot succeed.

## Realtime

Publication includes `orders`, `order_status_history`, `inventory`, `products`. Admin order lists subscribe; storefront catalog uses ISR/revalidate plus optional stock subscriptions on PDP.

## CMS as source of truth

Homepage sections, banners, featured category/product IDs, and section order live in `homepage_sections`, `banners`, and `site_settings`. Catalog CRUD lives in admin. Shipping copy and legal pages can move to CMS tables in later phases; Phase 1 seeds structure.

## Money

All currency columns are **integer paise** (INR × 100). Display via `formatInr`. Avoids float drift.

## Inventory

`locations` exists from day one. `inventory` is unique on `(location_id, variant_id)`. Available = `on_hand - reserved`. Movements are append-only. Multi-outlet and pickup are additive, not a rewrite.

## Notifications

`src/lib/notifications` defines a provider interface (email, SMS, WhatsApp). Phase 1 writes `notifications` outbox rows. Vendor SDKs are not scattered in UI.

## Future-safe seams (not built now)

Locations, delivery methods on variants, `orders.channel`, gift/custom fields as JSON, customer segments as tables later, payment provider enum, franchise as location groups.

## Deployment

- Vercel: Next.js
- Supabase: DB, Auth, Storage, Realtime
- Secrets only in server env. `NEXT_PUBLIC_*` is limited to URL + anon key + public Razorpay key (later).
