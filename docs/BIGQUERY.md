# BigQuery — Clumsy Cheetah

Warehouse for catalog, orders, inventory, and CMS. Signed in as **anita.sharma@clumsycheetah.in**.

Checkout, Auth, and row-level security stay on Postgres/Supabase. BigQuery is the Google Cloud database for reporting, catalog snapshots, and future admin analytics. It is not a replacement for live cart/payment transactions.

## Dataset

| | |
| --- | --- |
| Account | `anita.sharma@clumsycheetah.in` |
| Dataset | `commerce` |
| Location | `asia-south1` (Mumbai) |
| DDL | `bigquery/ddl/001_commerce.sql` |

Tables match the storefront schema: profiles, roles, addresses, locations, delivery, categories, collections, products, variants, images, inventory, carts, wishlists, coupons, orders, payments, refunds, reviews, homepage, banners, settings, notifications, audit logs.

Orders / payments / inventory movements are partitioned by date.

## One-time setup

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).

2. Sign in as Anita (browser will open):

```bash
gcloud auth login anita.sharma@clumsycheetah.in
gcloud auth application-default login
```

3. Create or pick a GCP project she can own, enable the BigQuery API, then set the project:

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable bigquery.googleapis.com
```

4. In `/Users/abhimanyuvasishta/Shivangi/.env.local`:

```
GCP_PROJECT_ID=YOUR_PROJECT_ID
BIGQUERY_DATASET=commerce
BIGQUERY_LOCATION=asia-south1
```

5. From the project folder:

```bash
cd /Users/abhimanyuvasishta/Shivangi
npm install
npm run bq:provision
```

Or paste `bigquery/ddl/001_commerce.sql` into [BigQuery Studio](https://console.cloud.google.com/bigquery) while logged in as `anita.sharma@clumsycheetah.in` (replace `` `commerce. `` with `` `YOUR_PROJECT_ID.commerce. `` if the editor requires a fully qualified name).

I cannot complete the Google login from this machine — that step has to be done in the browser as Anita.
