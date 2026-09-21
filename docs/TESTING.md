# Testing Clumsy Cheetah

## What you can click today (no login)

From the project folder:

```bash
cd /Users/abhimanyuvasishta/Shivangi
npm run dev
```

Open http://localhost:3000

Guest (no account):

- Homepage, shop, collections, product pages
- Search overlay
- Add to cart, cart drawer, cart page, checkout **layout** (no real payment)

That is enough to test the bakery storefront.

## Logins (needs Supabase)

There are no passwords in the repo. Create three real Auth users after you add keys.

1. Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

2. Run the SQL migrations, then `supabase/seed.sql`, in the Supabase SQL editor.

3. Pick a local-only password (min 8 characters) and seed users:

```bash
cd /Users/abhimanyuvasishta/Shivangi
TEST_USER_PASSWORD='ClumsyLocal1!' npm run seed:test-users
```

| Who | Email | Where to go after `/login` |
| --- | --- | --- |
| Customer | `customer@clumsycheetah.local` | Shop, account, cart |
| Vendor | `vendor@clumsycheetah.local` | `/admin` |
| Order manager | `orders@clumsycheetah.local` | `/admin/orders` |

Password = whatever you set as `TEST_USER_PASSWORD`.

Customer can shop and open `/account`. Vendor sees the admin shell. Order manager uses the orders screen (full ops land in a later phase; the route is gated).

Do not use these emails or that password in production.
