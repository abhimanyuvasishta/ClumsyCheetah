# Clumsy Cheetah

Production-oriented bakery commerce: Next.js App Router + Supabase. Storefront is emotional; `/admin` is staff-dense. Admin is the source of truth for catalog and merchandising.

## Phase 1 (now)

- Architecture docs in `docs/`
- Postgres schema, RLS, seed
- Storefront chrome, home, shop, collections, product detail
- Admin layout gated by real `user_roles` (no demo login)
- Payments intentionally not built

## Configure

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project.
3. Paste `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
5. Run `supabase/migrations/*.sql` then `supabase/seed.sql` in the SQL editor (or `supabase db push` + seed).
6. Auth: enable Email in Supabase. Sign up a user, then:

```sql
insert into public.user_roles (user_id, role)
values ('<auth user uuid>', 'ADMIN');
```

Until env vars exist, the storefront still renders the seeded catalog in-process so UI work is unblocked. After Supabase is linked, queries hit Postgres (falling back to seed if tables are empty).

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run bq:provision
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin).

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [BigQuery](docs/BIGQUERY.md)
