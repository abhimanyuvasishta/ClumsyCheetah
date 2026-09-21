# Clumsy Cheetah — Security

## Trust boundaries

- Browser is untrusted. It may send IDs and quantities, never prices or stock.
- Anon key is public; **RLS** is the product.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only (Route Handlers for webhooks, trusted jobs). Never `NEXT_PUBLIC_`.
- Razorpay secret and webhook secret are server-only (Phase 8).

## Auth

- Sessions via `@supabase/ssr` cookies; refresh in middleware.
- `/admin/*` requires authenticated user **and** a staff role in `user_roles`.
- Password hashes never stored in `profiles`. Never selected to clients.

## Authorization

- Postgres RLS on every public table (`enable row level security` with no policy = deny).
- Server Actions call `requireRole([...])` before mutations.
- Mass assignment: Zod picklists; clients cannot set `price_paise`, `status` on orders, or `role`.

## Payments (Phase 8)

- Create order in DB as `PLACED` / payment `PENDING`.
- Confirm only after signature/webhook verification.
- COD: still server-priced; inventory rules identical.

## Injection and XSS

- Parameterized Supabase client (no string-SQL from users).
- React default escaping; markdown (if added) sanitized.
- Storage uploads: MIME allowlist, size cap, authenticated staff only.

## Data

- Soft-delete catalog; audit_logs for admin mutations.
- PII in orders/addresses: customer sees own rows; staff sees for fulfillment.

## Rate limiting

Architecture: identify routes (`/auth`, checkout, coupon apply) for:

- Vercel / edge middleware counters, or
- Supabase Auth rate limits, plus
- Upstash Redis later

Phase 1 does not ship a Redis dependency.

## Secrets checklist

See `.env.example`. Rotate service role if it ever leaked to git or client bundles.
