-- Clumsy Cheetah commerce warehouse
-- Dataset: commerce  |  Location: asia-south1 (Mumbai)
-- Apply via: npm run bq:provision
-- or paste into BigQuery Studio signed in as anita.sharma@clumsycheetah.in

CREATE SCHEMA IF NOT EXISTS `commerce`
OPTIONS (
  location = "asia-south1",
  description = "Clumsy Cheetah ecommerce warehouse — catalog, orders, inventory, CMS"
);

CREATE TABLE IF NOT EXISTS `commerce.profiles` (
  id STRING NOT NULL OPTIONS(description="Auth user UUID"),
  full_name STRING,
  phone STRING,
  avatar_url STRING,
  status STRING DEFAULT "ACTIVE",
  marketing_opt_in BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.user_roles` (
  id STRING NOT NULL,
  user_id STRING NOT NULL,
  role STRING NOT NULL,
  assigned_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  revoked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.addresses` (
  id STRING NOT NULL,
  user_id STRING NOT NULL,
  label STRING,
  full_name STRING NOT NULL,
  phone STRING NOT NULL,
  line1 STRING NOT NULL,
  line2 STRING,
  landmark STRING,
  city STRING NOT NULL,
  state STRING NOT NULL,
  pincode STRING NOT NULL,
  country STRING DEFAULT "IN",
  delivery_instructions STRING,
  is_default BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.locations` (
  id STRING NOT NULL,
  name STRING NOT NULL,
  slug STRING NOT NULL,
  phone STRING,
  email STRING,
  line1 STRING,
  city STRING,
  state STRING,
  pincode STRING,
  is_active BOOL DEFAULT TRUE,
  timezone STRING DEFAULT "Asia/Kolkata",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.delivery_zones` (
  id STRING NOT NULL,
  location_id STRING NOT NULL,
  name STRING NOT NULL,
  pincode STRING NOT NULL,
  delivery_fee_paise INT64 DEFAULT 0,
  min_order_paise INT64 DEFAULT 0,
  free_delivery_threshold_paise INT64,
  lead_time_hours INT64 DEFAULT 2,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.delivery_slots` (
  id STRING NOT NULL,
  location_id STRING NOT NULL,
  label STRING NOT NULL,
  starts_at STRING NOT NULL,
  ends_at STRING NOT NULL,
  capacity INT64 DEFAULT 20,
  sort_order INT64 DEFAULT 0,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.categories` (
  id STRING NOT NULL,
  parent_id STRING,
  name STRING NOT NULL,
  slug STRING NOT NULL,
  description STRING,
  image_url STRING,
  sort_order INT64 DEFAULT 0,
  is_active BOOL DEFAULT TRUE,
  seo_title STRING,
  seo_description STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.collections` (
  id STRING NOT NULL,
  name STRING NOT NULL,
  slug STRING NOT NULL,
  description STRING,
  image_url STRING,
  collection_type STRING DEFAULT "MERCHANDISING",
  sort_order INT64 DEFAULT 0,
  is_active BOOL DEFAULT TRUE,
  seo_title STRING,
  seo_description STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.products` (
  id STRING NOT NULL,
  name STRING NOT NULL,
  slug STRING NOT NULL,
  sku STRING,
  short_description STRING,
  long_description STRING,
  primary_category_id STRING,
  tags ARRAY<STRING>,
  thumbnail_url STRING,
  is_featured BOOL DEFAULT FALSE,
  is_bestseller BOOL DEFAULT FALSE,
  is_new_arrival BOOL DEFAULT FALSE,
  is_vegetarian BOOL DEFAULT TRUE,
  is_eggless BOOL DEFAULT TRUE,
  contains_egg BOOL DEFAULT FALSE,
  allergen_info STRING,
  ingredients STRING,
  serving_size STRING,
  weight_label STRING,
  preparation_time_hours INT64,
  shelf_life STRING,
  storage_instructions STRING,
  tax_rate_bps INT64 DEFAULT 1800,
  hsn_code STRING,
  status STRING DEFAULT "DRAFT",
  available_location_ids ARRAY<STRING>,
  available_methods ARRAY<STRING>,
  seo_title STRING,
  seo_description STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP,
  archived_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.product_variants` (
  id STRING NOT NULL,
  product_id STRING NOT NULL,
  sku STRING NOT NULL,
  name STRING NOT NULL,
  flavour STRING,
  weight_grams INT64,
  weight_label STRING,
  price_paise INT64 NOT NULL,
  compare_at_paise INT64,
  status STRING DEFAULT "ACTIVE",
  unlimited_inventory BOOL DEFAULT FALSE,
  low_stock_threshold INT64 DEFAULT 5,
  min_order_qty INT64 DEFAULT 1,
  max_order_qty INT64,
  sort_order INT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.product_images` (
  id STRING NOT NULL,
  product_id STRING NOT NULL,
  url STRING NOT NULL,
  alt STRING,
  sort_order INT64 DEFAULT 0,
  is_primary BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.product_categories` (
  product_id STRING NOT NULL,
  category_id STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS `commerce.collection_products` (
  collection_id STRING NOT NULL,
  product_id STRING NOT NULL,
  sort_order INT64 DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `commerce.product_tags` (
  product_id STRING NOT NULL,
  tag STRING NOT NULL
);

CREATE TABLE IF NOT EXISTS `commerce.inventory` (
  id STRING NOT NULL,
  location_id STRING NOT NULL,
  variant_id STRING NOT NULL,
  on_hand INT64 DEFAULT 0,
  reserved INT64 DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.inventory_movements` (
  id STRING NOT NULL,
  inventory_id STRING NOT NULL,
  movement_type STRING NOT NULL,
  quantity INT64 NOT NULL,
  reason STRING,
  order_id STRING,
  created_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY inventory_id, movement_type;

CREATE TABLE IF NOT EXISTS `commerce.carts` (
  id STRING NOT NULL,
  user_id STRING,
  session_id STRING,
  coupon_code STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.cart_items` (
  id STRING NOT NULL,
  cart_id STRING NOT NULL,
  variant_id STRING NOT NULL,
  quantity INT64 NOT NULL,
  saved_for_later BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.wishlists` (
  id STRING NOT NULL,
  user_id STRING NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.wishlist_items` (
  id STRING NOT NULL,
  wishlist_id STRING NOT NULL,
  product_id STRING NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.coupons` (
  id STRING NOT NULL,
  code STRING NOT NULL,
  description STRING,
  coupon_type STRING NOT NULL,
  percent_off NUMERIC,
  amount_off_paise INT64,
  min_order_paise INT64 DEFAULT 0,
  max_discount_paise INT64,
  usage_limit INT64,
  usage_per_customer INT64 DEFAULT 1,
  applicable_category_ids ARRAY<STRING>,
  applicable_product_ids ARRAY<STRING>,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.coupon_usage` (
  id STRING NOT NULL,
  coupon_id STRING NOT NULL,
  user_id STRING,
  order_id STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.orders` (
  id STRING NOT NULL,
  order_number STRING NOT NULL,
  user_id STRING,
  location_id STRING,
  status STRING DEFAULT "PLACED",
  contact_name STRING NOT NULL,
  contact_phone STRING NOT NULL,
  contact_email STRING,
  shipping_address JSON,
  delivery_date DATE,
  delivery_slot_id STRING,
  delivery_slot_label STRING,
  fulfillment_method STRING DEFAULT "DELIVERY",
  customer_notes STRING,
  gift_message STRING,
  is_gift BOOL DEFAULT FALSE,
  staff_notes STRING,
  subtotal_paise INT64 DEFAULT 0,
  discount_paise INT64 DEFAULT 0,
  tax_paise INT64 DEFAULT 0,
  delivery_fee_paise INT64 DEFAULT 0,
  total_paise INT64 DEFAULT 0,
  coupon_code STRING,
  channel STRING DEFAULT "WEB",
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  cancelled_at TIMESTAMP
)
PARTITION BY DATE(placed_at)
CLUSTER BY status, location_id;

CREATE TABLE IF NOT EXISTS `commerce.order_items` (
  id STRING NOT NULL,
  order_id STRING NOT NULL,
  product_id STRING,
  variant_id STRING,
  product_name STRING NOT NULL,
  variant_name STRING,
  sku STRING,
  quantity INT64 NOT NULL,
  unit_price_paise INT64 NOT NULL,
  tax_paise INT64 DEFAULT 0,
  line_total_paise INT64 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.order_status_history` (
  id STRING NOT NULL,
  order_id STRING NOT NULL,
  from_status STRING,
  to_status STRING NOT NULL,
  note STRING,
  changed_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY order_id;

CREATE TABLE IF NOT EXISTS `commerce.payments` (
  id STRING NOT NULL,
  order_id STRING NOT NULL,
  provider STRING NOT NULL,
  status STRING DEFAULT "PENDING",
  amount_paise INT64 NOT NULL,
  currency STRING DEFAULT "INR",
  provider_order_id STRING,
  provider_payment_id STRING,
  provider_reference STRING,
  raw_payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY status, provider;

CREATE TABLE IF NOT EXISTS `commerce.refunds` (
  id STRING NOT NULL,
  payment_id STRING NOT NULL,
  amount_paise INT64 NOT NULL,
  reason STRING,
  provider_refund_id STRING,
  created_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.reviews` (
  id STRING NOT NULL,
  product_id STRING NOT NULL,
  user_id STRING,
  rating INT64 NOT NULL,
  title STRING,
  body STRING,
  is_published BOOL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.homepage_sections` (
  id STRING NOT NULL,
  key STRING NOT NULL,
  title STRING,
  subtitle STRING,
  sort_order INT64 DEFAULT 0,
  is_visible BOOL DEFAULT TRUE,
  config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.banners` (
  id STRING NOT NULL,
  title STRING NOT NULL,
  subtitle STRING,
  cta_label STRING,
  cta_href STRING,
  image_url STRING NOT NULL,
  placement STRING DEFAULT "HERO",
  sort_order INT64 DEFAULT 0,
  is_active BOOL DEFAULT TRUE,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.site_settings` (
  key STRING NOT NULL,
  value JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS `commerce.notifications` (
  id STRING NOT NULL,
  channel STRING NOT NULL,
  template_key STRING NOT NULL,
  recipient STRING NOT NULL,
  payload JSON,
  status STRING DEFAULT "PENDING",
  error STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  sent_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `commerce.audit_logs` (
  id STRING NOT NULL,
  actor_id STRING,
  action STRING NOT NULL,
  resource_type STRING NOT NULL,
  resource_id STRING,
  previous_value JSON,
  new_value JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY resource_type, action;
