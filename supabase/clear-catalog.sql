-- Wipe bakery products so you can enter the real catalog.
-- Categories and collections stay. Order lines are detached from products.

update public.order_items set product_id = null, variant_id = null;

delete from public.inventory_movements;
delete from public.inventory;
delete from public.collection_products;
delete from public.product_tags;
delete from public.product_categories;
delete from public.product_images;
delete from public.product_variants;
delete from public.products;
