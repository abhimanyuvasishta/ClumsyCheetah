# Clumsy Cheetah — Roadmap

## Phase 0 — Architecture (this drop)

Docs, folder layout, schema, migrations, types, env contract.

## Phase 1 — Foundation (this drop)

Next.js App Router, Tailwind, shadcn/ui, design tokens, storefront chrome, homepage/shop/PDP shells, ProductCard, admin layout with **real** session + role gate, seed catalog.

## Phase 2 — Storefront depth

Category pages, search/filter/sort, related products, recently viewed, legal/content pages, 404, SEO (sitemap, JSON-LD), CMS-driven homepage.

## Phase 3 — Authentication

Email/password, Google, password reset, profile, addresses. Phone OTP plumbing. No fake users.

## Phase 4 — Catalog admin

Amazon-style product table, variant editor, image upload to Storage, categories/collections, bulk activate, duplicate/archive, CSV import/export **architecture** + first working import.

## Phase 5 — Cart

Guest local cart, logged-in persistence, merge on login, save-for-later, wishlist.

## Phase 6 — Checkout

Addresses, slots, gift message, coupon validation (server), order create with server-side pricing.

## Phase 7 — Order management

Filters, detail, timeline, staff notes, realtime list, customer order history.

## Phase 8 — Payments

Razorpay + COD, webhook verification, payment status machine. No card storage.

## Phase 9 — Inventory

Reserve on confirm, release on cancel, low-stock, location-aware availability.

## Phase 10 — Analytics and polish

Dashboard metrics with date ranges, coupons UI, delivery config UI, Core Web Vitals pass.

## Phase 11 — Production readiness

RLS audit, rate-limit middleware/WAF notes, tests for money paths, load checks, runbooks.

## Explicitly later

Multi-outlet pickup, 3PL, Swiggy/Zomato, WhatsApp, loyalty, gift cards, subscriptions, custom cakes, franchise, mobile apps, CRM, recommendations.
