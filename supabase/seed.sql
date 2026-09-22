-- Development catalog for Clumsy Cheetah. Safe to re-run on empty tables.

insert into public.locations (id, name, slug, phone, city, state, pincode)
values (
  'a0000000-0000-4000-8000-000000000001',
  'Clumsy Cheetah Kitchen — Bandra',
  'bandra',
  '+91 22 0000 0000',
  'Mumbai',
  'Maharashtra',
  '400050'
) on conflict (id) do nothing;

insert into public.delivery_zones (location_id, name, pincode, delivery_fee_paise, min_order_paise, free_delivery_threshold_paise, lead_time_hours)
values
  ('a0000000-0000-4000-8000-000000000001', 'Bandra West', '400050', 4900, 39900, 99900, 3),
  ('a0000000-0000-4000-8000-000000000001', 'Khar', '400052', 6900, 39900, 129900, 4),
  ('a0000000-0000-4000-8000-000000000001', 'Andheri West', '400058', 8900, 49900, 149900, 5)
on conflict do nothing;

insert into public.delivery_slots (location_id, label, starts_at, ends_at, capacity, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', '10 AM – 12 PM', '10:00', '12:00', 18, 1),
  ('a0000000-0000-4000-8000-000000000001', '12 PM – 2 PM', '12:00', '14:00', 18, 2),
  ('a0000000-0000-4000-8000-000000000001', '2 PM – 4 PM', '14:00', '16:00', 18, 3),
  ('a0000000-0000-4000-8000-000000000001', '4 PM – 6 PM', '16:00', '18:00', 20, 4),
  ('a0000000-0000-4000-8000-000000000001', '6 PM – 8 PM', '18:00', '20:00', 16, 5);

insert into public.categories (id, name, slug, description, sort_order, image_url) values
  ('c0000000-0000-4000-8000-000000000001', 'Cakes', 'cakes', 'Layered celebration cakes, finished by hand.', 1, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'),
  ('c0000000-0000-4000-8000-000000000002', 'Pastries', 'pastries', 'French-leaning pastry case favourites.', 2, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
  ('c0000000-0000-4000-8000-000000000003', 'Brownies', 'brownies', 'Fudgy slabs, still slightly clumsy at the edges.', 3, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800'),
  ('c0000000-0000-4000-8000-000000000004', 'Cheesecakes', 'cheesecakes', 'Baked and chilled, never boring.', 4, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800'),
  ('c0000000-0000-4000-8000-000000000005', 'Cookies', 'cookies', 'Thick, chewy, sea-salted when it helps.', 5, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800'),
  ('c0000000-0000-4000-8000-000000000006', 'Desserts', 'desserts', 'Cups, tarts, and plated sweets.', 6, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'),
  ('c0000000-0000-4000-8000-000000000007', 'Breads', 'breads', 'Butter-laminated and slow-fermented.', 7, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
  ('c0000000-0000-4000-8000-000000000008', 'Savouries', 'savouries', 'For the person who “doesn’t eat dessert”.', 8, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800'),
  ('c0000000-0000-4000-8000-000000000009', 'Gift Hampers', 'gift-hampers', 'Ribboned boxes that actually arrive looking proud.', 9, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'),
  ('c0000000-0000-4000-8000-000000000010', 'Celebration Specials', 'celebration-specials', 'When the occasion is the brief.', 10, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800')
on conflict (id) do nothing;

insert into public.collections (id, name, slug, description, collection_type, sort_order) values
  ('b0000000-0000-4000-8000-000000000001', 'Best Sellers', 'best-sellers', 'The case empties first.', 'FEATURED', 1),
  ('b0000000-0000-4000-8000-000000000002', 'New Arrivals', 'new-arrivals', 'Just out of the oven.', 'FEATURED', 2),
  ('b0000000-0000-4000-8000-000000000003', 'Birthday', 'birthday', 'Cakes for the main character.', 'OCCASION', 3),
  ('b0000000-0000-4000-8000-000000000004', 'Anniversary', 'anniversary', 'Shareable, slightly extra.', 'OCCASION', 4),
  ('b0000000-0000-4000-8000-000000000005', 'Wedding', 'wedding', 'Elegant, not stiff.', 'OCCASION', 5),
  ('b0000000-0000-4000-8000-000000000006', 'Congratulations', 'congratulations', 'For promotions, keys, and yeses.', 'OCCASION', 6),
  ('b0000000-0000-4000-8000-000000000007', 'Baby Shower', 'baby-shower', 'Soft palettes, serious flavour.', 'OCCASION', 7),
  ('b0000000-0000-4000-8000-000000000008', 'Corporate Gifting', 'corporate-gifting', 'Hampers that don’t feel like leftover Diwali.', 'OCCASION', 8),
  ('b0000000-0000-4000-8000-000000000009', 'Festive', 'festive', 'Seasonal drops.', 'OCCASION', 9),
  ('b0000000-0000-4000-8000-000000000010', 'Just Because', 'just-because', 'No occasion required.', 'OCCASION', 10)
on conflict (id) do nothing;

insert into public.products (
  id, name, slug, sku, short_description, long_description, primary_category_id, tags,
  thumbnail_url, is_featured, is_bestseller, is_new_arrival, is_vegetarian, is_eggless, contains_egg,
  allergen_info, ingredients, serving_size, preparation_time_hours, shelf_life, storage_instructions,
  status, available_location_ids, seo_title, seo_description
) values
('d0000000-0000-4000-8000-000000000001', 'Belgian Chocolate Truffle Cake', 'belgian-chocolate-truffle-cake', 'CK-BCT-BASE',
 'Dark ganache, soft crumb, unapologetically chocolate.',
 'Three layers of cocoa sponge soaked just enough, filled with Belgian ganache and finished with a truffle glaze. The house cake for people who mean it.',
 'c0000000-0000-4000-8000-000000000001', '{chocolate,cake,truffle,celebration}',
 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200', true, true, false, true, true, false,
 'Contains milk, wheat, soy. May contain tree nuts.',
 'Cocoa sponge, Belgian dark chocolate, cream, butter, sugar, wheat flour.',
 'Serves 6–20 depending on weight', 4, '48 hours refrigerated', 'Keep chilled. Bring to room temperature 30 minutes before serving.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Belgian Chocolate Truffle Cake | Clumsy Cheetah',
 'Order our signature Belgian chocolate truffle cake in Mumbai. Eggless, made fresh.'),

('d0000000-0000-4000-8000-000000000002', 'Classic Red Velvet Cake', 'classic-red-velvet-cake', 'CK-CRV-BASE',
 'Cocoa-kissed crumb, tangy cream cheese, no neon drama.',
 'A proper red velvet: buttermilk crumb, a hint of cocoa, and cream cheese frosting that is tart rather than cloying.',
 'c0000000-0000-4000-8000-000000000001', '{red-velvet,cake,cream-cheese}',
 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=1200', true, true, false, true, false, true,
 'Contains egg, milk, wheat.', 'Red velvet sponge, cream cheese, butter, sugar, cocoa.',
 'Serves 6–20', 5, '48 hours refrigerated', 'Keep refrigerated.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Classic Red Velvet Cake | Clumsy Cheetah',
 'Soft red velvet with cream cheese frosting, baked in Bandra.'),

('d0000000-0000-4000-8000-000000000003', 'Lotus Biscoff Cheesecake', 'lotus-biscoff-cheesecake', 'CH-LBC-BASE',
 'Cookie butter, baked cheesecake, a little too easy to finish.',
 'Biscoff crumb base, vanilla cheesecake, molten cookie-butter swirl and a shard of caramelised biscuit.',
 'c0000000-0000-4000-8000-000000000004', '{biscoff,cheesecake,lotus}',
 'https://images.unsplash.com/photo-1470124182910-d2a89a2a0ebc?w=1200', true, true, true, true, true, false,
 'Contains wheat, milk, soy.', 'Cream cheese, Biscoff, cream, sugar, wheat biscuits.',
 'Serves 8', 8, '72 hours refrigerated', 'Keep chilled. Do not freeze garnish.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Lotus Biscoff Cheesecake | Clumsy Cheetah',
 'Eggless Biscoff cheesecake with cookie butter swirl.'),

('d0000000-0000-4000-8000-000000000004', 'Blueberry Cheesecake', 'blueberry-cheesecake', 'CH-BLU-BASE',
 'Baked vanilla cheesecake, glossy blueberry compote.',
 'New York style bake, cooled slowly, topped with a sharp blueberry jam so it does not taste like candy.',
 'c0000000-0000-4000-8000-000000000004', '{blueberry,cheesecake}',
 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=1200', true, false, false, true, true, false,
 'Contains milk, wheat.', 'Cream cheese, blueberries, biscuit crumb, cream.',
 'Serves 8', 8, '72 hours refrigerated', 'Keep refrigerated.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Blueberry Cheesecake | Clumsy Cheetah',
 'Eggless baked blueberry cheesecake.'),

('d0000000-0000-4000-8000-000000000005', 'Chocolate Fudge Brownie', 'chocolate-fudge-brownie', 'BR-CFB-BASE',
 'Crackly top, damp centre, sea salt.',
 'Our brownie is closer to ganache than cake. Walnut optional; salt is not.',
 'c0000000-0000-4000-8000-000000000003', '{brownie,chocolate,fudge}',
 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200', true, true, false, true, false, true,
 'Contains egg, wheat, milk. May contain nuts.', 'Dark chocolate, butter, sugar, eggs, cocoa, wheat flour.',
 'Box of 4 or 9', 2, '5 days airtight', 'Room temperature, away from sun.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Chocolate Fudge Brownie | Clumsy Cheetah',
 'Fudgy chocolate brownies baked fresh in Mumbai.'),

('d0000000-0000-4000-8000-000000000006', 'Nutella Brownie', 'nutella-brownie', 'BR-NUT-BASE',
 'Hazelnut swirl through the house fudge batter.',
 'Same fudgy slab, ribbons of Nutella, toasted hazelnut on top.',
 'c0000000-0000-4000-8000-000000000003', '{brownie,nutella,hazelnut}',
 'https://images.unsplash.com/photo-1612886443442-361576e20986?w=1200', false, true, false, true, false, true,
 'Contains egg, wheat, milk, hazelnut.', 'Dark chocolate, Nutella, hazelnuts, butter, eggs.',
 'Box of 4 or 9', 2, '5 days', 'Airtight, room temperature.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Nutella Brownie | Clumsy Cheetah',
 'Hazelnut Nutella brownies from Clumsy Cheetah.'),

('d0000000-0000-4000-8000-000000000007', 'Classic Tiramisu', 'classic-tiramisu', 'DS-TIR-BASE',
 'Espresso, mascarpone, a polite amount of cocoa.',
 'Ladyfingers dipped, not drowned. Mascarpone cream set overnight.',
 'c0000000-0000-4000-8000-000000000006', '{tiramisu,coffee,italian}',
 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200', true, true, false, true, false, true,
 'Contains egg, milk, wheat, caffeine.', 'Mascarpone, cream, espresso, ladyfingers, cocoa.',
 'Serves 6', 12, '48 hours refrigerated', 'Keep chilled. Contains alcohol-free espresso soak by default.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Classic Tiramisu | Clumsy Cheetah',
 'House tiramisu made with espresso and mascarpone.'),

('d0000000-0000-4000-8000-000000000008', 'Chocolate Éclair', 'chocolate-eclair', 'PA-ECL-BASE',
 'Choux, crème diplomate, dark fondant.',
 'Piped the morning you receive it. The clumsiness is in the shine, not the pastry.',
 'c0000000-0000-4000-8000-000000000002', '{eclair,choux,chocolate}',
 'https://images.unsplash.com/photo-1612203985729-70726954388c?w=1200', false, false, true, true, false, true,
 'Contains egg, milk, wheat.', 'Choux pastry, pastry cream, dark chocolate.',
 'Box of 4', 6, 'Same day best', 'Refrigerate, eat the same day.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Chocolate Éclair | Clumsy Cheetah',
 'Fresh chocolate éclairs from our pastry case.'),

('d0000000-0000-4000-8000-000000000009', 'Fresh Fruit Tart', 'fresh-fruit-tart', 'PA-FFT-BASE',
 'Vanilla tart shell, diplomat cream, market fruit.',
 'Fruit changes with the week. The shell stays crisp if you do not wait two days.',
 'c0000000-0000-4000-8000-000000000002', '{tart,fruit,pastry}',
 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=1200', true, false, true, true, false, true,
 'Contains egg, milk, wheat. Fruit may vary.', 'Tart dough, vanilla cream, seasonal fruit, glaze.',
 'Whole tart, 7 inch', 6, '24 hours', 'Keep refrigerated.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Fresh Fruit Tart | Clumsy Cheetah',
 'Seasonal fruit tart with vanilla cream.'),

('d0000000-0000-4000-8000-000000000010', 'Butter Croissant', 'butter-croissant', 'BRD-CRO-BASE',
 '72-hour laminate, loud shatter.',
 'French butter, three folds, baked darker than mall croissants.',
 'c0000000-0000-4000-8000-000000000007', '{croissant,bread,butter}',
 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200', true, true, false, true, false, true,
 'Contains egg, milk, wheat.', 'Wheat flour, French butter, milk, yeast, egg wash.',
 '1 piece', 48, 'Best same day', 'Room temperature. Recrisp 4 minutes at 180°C.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Butter Croissant | Clumsy Cheetah',
 'Laminated butter croissants baked in Bandra.'),

('d0000000-0000-4000-8000-000000000011', 'Pain au Chocolat', 'pain-au-chocolat', 'BRD-PAC-BASE',
 'The croissant’s more serious sibling.',
 'Two batons of dark chocolate in the same laminate as the croissant.',
 'c0000000-0000-4000-8000-000000000007', '{pain-au-chocolat,chocolate,viennoiserie}',
 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=1200', false, true, false, true, false, true,
 'Contains egg, milk, wheat, soy.', 'Laminated dough, dark chocolate batons.',
 '1 piece', 48, 'Best same day', 'Recrisp before serving.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Pain au Chocolat | Clumsy Cheetah',
 'Chocolate pastry baked fresh daily.'),

('d0000000-0000-4000-8000-000000000012', 'Double Chocolate Cookie', 'double-chocolate-cookie', 'CKI-DCC-BASE',
 'Cocoa dough, two chocolates, thick.',
 'Not a thin American diner cookie. Ours stays fudgy in the middle.',
 'c0000000-0000-4000-8000-000000000005', '{cookie,chocolate}',
 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200', true, true, false, true, false, true,
 'Contains egg, wheat, milk, soy.', 'Cocoa, dark & milk chocolate, butter, brown sugar.',
 'Box of 6', 1, '7 days', 'Airtight tin.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Double Chocolate Cookie | Clumsy Cheetah',
 'Thick double chocolate cookies.'),

('d0000000-0000-4000-8000-000000000013', 'Sea Salt Chocolate Cookie', 'sea-salt-chocolate-cookie', 'CKI-SSC-BASE',
 'Brown-butter dough, puddles of chocolate, Maldon.',
 'The cookie we pack for people who say they do not like sweets.',
 'c0000000-0000-4000-8000-000000000005', '{cookie,sea-salt,chocolate}',
 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200', true, true, false, true, false, true,
 'Contains egg, wheat, milk, soy.', 'Brown butter, chocolate, sea salt, wheat flour.',
 'Box of 6', 1, '7 days', 'Airtight tin.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Sea Salt Chocolate Cookie | Clumsy Cheetah',
 'Brown butter sea salt chocolate cookies.'),

('d0000000-0000-4000-8000-000000000014', 'Celebration Gift Box', 'celebration-gift-box', 'GFT-CELE-BASE',
 'A curated mix that looks like you tried.',
 'Brownies, cookies, a mini cheesecake, and a handwritten card.',
 'c0000000-0000-4000-8000-000000000009', '{hamper,gift,celebration}',
 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200', true, true, false, true, false, true,
 'See individual items. May contain egg, nuts, wheat, milk.',
 'Assorted bakery items. Exact mix may vary with the season.',
 '1 box', 6, 'See items', 'Keep cool.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Celebration Gift Box | Clumsy Cheetah',
 'Gift hamper of brownies, cookies and mini cheesecake.'),

('d0000000-0000-4000-8000-000000000015', 'Vanilla Bean Cheesecake', 'vanilla-bean-cheesecake', 'CH-VAN-BASE',
 'Tahitian vanilla, biscuit crumb, nothing else shouting.',
 'For the vanilla person who is tired of being offered chocolate.',
 'c0000000-0000-4000-8000-000000000004', '{vanilla,cheesecake}',
 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200', false, false, false, true, true, false,
 'Contains milk, wheat.', 'Cream cheese, vanilla bean, cream, biscuit.',
 'Serves 8', 8, '72 hours', 'Refrigerate.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Vanilla Bean Cheesecake | Clumsy Cheetah',
 'Eggless vanilla bean cheesecake.'),

('d0000000-0000-4000-8000-000000000016', 'Opera Cake Slice', 'opera-cake-slice', 'PA-OPR-BASE',
 'Joconde, coffee buttercream, ganache, gold.',
 'A precise slice. We still call the brand clumsy.',
 'c0000000-0000-4000-8000-000000000002', '{opera,coffee,almond}',
 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1200', false, false, true, true, false, true,
 'Contains egg, milk, wheat, almond.', 'Almond joconde, coffee, chocolate ganache.',
 '1 slice', 10, '48 hours', 'Refrigerate.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Opera Cake Slice | Clumsy Cheetah',
 'Classic opera pastry slice.'),

('d0000000-0000-4000-8000-000000000017', 'Mango Passion Cake', 'mango-passion-cake', 'CK-MPC-BASE',
 'Alphonso season energy, even when it isn’t.',
 'Light sponge, mango confit, passion fruit gel, whipped ganache.',
 'c0000000-0000-4000-8000-000000000001', '{mango,passionfruit,cake}',
 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200', true, false, true, true, true, false,
 'Contains milk, wheat.', 'Sponge, mango, passion fruit, cream.',
 'Serves 6–16', 6, '36 hours', 'Keep chilled.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Mango Passion Cake | Clumsy Cheetah',
 'Eggless mango passion fruit celebration cake.'),

('d0000000-0000-4000-8000-000000000018', 'Black Forest Cake', 'black-forest-cake', 'CK-BFC-BASE',
 'Kirschen, cream, chocolate shavings — grown-up, not 1998 buffet.',
 'Sour cherry compote, barely-sweet cream, dark chocolate.',
 'c0000000-0000-4000-8000-000000000001', '{black-forest,cherry,cake}',
 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1200', false, true, false, true, false, true,
 'Contains egg, milk, wheat. Cherry may include pit fragments.',
 'Chocolate sponge, cherries, cream, chocolate.',
 'Serves 6–20', 5, '36 hours', 'Keep chilled.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Black Forest Cake | Clumsy Cheetah',
 'Cherry and cream black forest cake.'),

('d0000000-0000-4000-8000-000000000019', 'Sourdough Country Loaf', 'sourdough-country-loaf', 'BRD-SDL-BASE',
 'Wild yeast, open crumb, proud ear.',
 'Baked for people who put good butter on things.',
 'c0000000-0000-4000-8000-000000000007', '{sourdough,bread}',
 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200', false, false, false, true, true, false,
 'Contains wheat. Fermented naturally.', 'Wheat, water, salt, levain.',
 '900 g loaf', 24, '3 days', 'Cut side down. Freeze extra.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Sourdough Country Loaf | Clumsy Cheetah',
 'Naturally leavened country sourdough.'),

('d0000000-0000-4000-8000-000000000020', 'Garlic Cheese Savoury', 'garlic-cheese-savoury', 'SAV-GCS-BASE',
 'Pull-apart, roasted garlic, mozzarella.',
 'The order that lands next to every birthday cake.',
 'c0000000-0000-4000-8000-000000000008', '{savoury,garlic,cheese}',
 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1200', false, false, true, true, false, true,
 'Contains egg, milk, wheat.', 'Enriched dough, garlic butter, mozzarella.',
 '1 tray', 4, 'Same day', 'Warm before serving.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Garlic Cheese Savoury | Clumsy Cheetah',
 'Roasted garlic cheese pull-apart.'),

('d0000000-0000-4000-8000-000000000021', 'New York Cheesecake', 'new-york-cheesecake', 'CH-NYC-BASE',
 'Dense, bronzed, sour cream top.',
 'The American classic, not a mousse in disguise.',
 'c0000000-0000-4000-8000-000000000004', '{new-york,cheesecake}',
 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=1200', false, true, false, true, false, true,
 'Contains egg, milk, wheat.', 'Cream cheese, sour cream, eggs, biscuit.',
 'Serves 10', 10, '5 days', 'Refrigerate.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'New York Cheesecake | Clumsy Cheetah',
 'Baked New York cheesecake.'),

('d0000000-0000-4000-8000-000000000022', 'Raspberry Macaron Box', 'raspberry-macaron-box', 'PA-MAC-BASE',
 'Shells with feet, raspberry ganache.',
 'A box that photographs well and actually tastes of fruit.',
 'c0000000-0000-4000-8000-000000000002', '{macaron,raspberry,gift}',
 'https://images.unsplash.com/photo-1569864357585-41ae8f1aa322?w=1200', false, false, true, true, false, true,
 'Contains egg, almond, milk.', 'Almond meringue, raspberry ganache.',
 'Box of 6', 24, '5 days refrigerated', 'Bring to room temp 10 minutes.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Raspberry Macaron Box | Clumsy Cheetah',
 'Raspberry macarons in a gift box.'),

('d0000000-0000-4000-8000-000000000023', 'Banoffee Pie', 'banoffee-pie', 'DS-BAN-BASE',
 'Banoffee without the cafeteria energy.',
 'Biscuit, dark caramel, banana, barely-sweet cream.',
 'c0000000-0000-4000-8000-000000000006', '{banoffee,banana,caramel}',
 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200', false, false, false, true, true, false,
 'Contains milk, wheat.', 'Biscuit, caramel, banana, cream.',
 'Serves 8', 6, '24 hours', 'Keep chilled. Assemble banana day-of.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Banoffee Pie | Clumsy Cheetah',
 'Eggless banoffee pie.'),

('d0000000-0000-4000-8000-000000000024', 'Pistachio Baklava Box', 'pistachio-baklava-box', 'DS-BAK-BASE',
 'Phyllo, clarified butter, lots of pistachio.',
 'Sweet, but not syrup-logged.',
 'c0000000-0000-4000-8000-000000000006', '{baklava,pistachio,gift}',
 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1200', false, false, false, true, true, false,
 'Contains wheat, pistachio, butter.', 'Phyllo, pistachio, butter, sugar syrup.',
 'Box of 9', 8, '7 days', 'Cool and dry.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Pistachio Baklava | Clumsy Cheetah',
 'Pistachio baklava gift box.'),

('d0000000-0000-4000-8000-000000000025', 'Lemon Olive Oil Cake', 'lemon-olive-oil-cake', 'CK-LOC-BASE',
 'Liguria oil, Amalfi lemon, no frosting needed.',
 'A loaf that behaves like a gift. Dust of sugar.',
 'c0000000-0000-4000-8000-000000000001', '{lemon,olive-oil,loaf}',
 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=1200', false, false, true, true, false, true,
 'Contains egg, wheat. Made with extra virgin olive oil.',
 'Olive oil, lemon, eggs, wheat, sugar.',
 '1 loaf', 4, '4 days', 'Covered, cool place.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Lemon Olive Oil Cake | Clumsy Cheetah',
 'Lemon olive oil loaf cake.'),

('d0000000-0000-4000-8000-000000000026', 'Cinnamon Roll', 'cinnamon-roll', 'BRD-CIN-BASE',
 'Overnight dough, dark cinnamon, cream cheese smear.',
 'Sticky on purpose.',
 'c0000000-0000-4000-8000-000000000007', '{cinnamon,breakfast}',
 'https://images.unsplash.com/photo-1509365465985-52d5c27a0de9?w=1200', false, false, true, true, false, true,
 'Contains egg, milk, wheat.', 'Enriched dough, cinnamon sugar, cream cheese icing.',
 'Box of 4', 16, 'Same day', 'Warm 3 minutes.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Cinnamon Roll | Clumsy Cheetah',
 'Overnight cinnamon rolls.'),

('d0000000-0000-4000-8000-000000000027', 'Mixed Berry Pavlova', 'mixed-berry-pavlova', 'DS-PAV-BASE',
 'Marshmallow meringue, cream, berries.',
 'We assemble close to dispatch so it still crunches.',
 'c0000000-0000-4000-8000-000000000006', '{pavlova,berry,meringue}',
 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200', false, false, true, true, false, true,
 'Contains egg, milk.', 'Meringue, cream, mixed berries.',
 'Serves 6', 10, 'Best same day', 'Cool and dry until cream is added.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Mixed Berry Pavlova | Clumsy Cheetah',
 'Berry pavlova made to order.'),

('d0000000-0000-4000-8000-000000000028', 'Corporate Cookie Hamper', 'corporate-cookie-hamper', 'GFT-CORP-BASE',
 'A hamper that does not apologise for being cookies.',
 'Two dozen mixed cookies, branded card, ribbon.',
 'c0000000-0000-4000-8000-000000000009', '{corporate,hamper,cookies}',
 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200', false, false, false, true, false, true,
 'Contains egg, wheat, milk, soy. May contain nuts.',
 'Assorted cookies.',
 '24 cookies', 24, '7 days', 'Cool and dry.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Corporate Cookie Hamper | Clumsy Cheetah',
 'Bulk cookie hamper for offices.'),

('d0000000-0000-4000-8000-000000000029', 'Dark Chocolate Mousse Cup', 'dark-chocolate-mousse-cup', 'DS-MOU-BASE',
 '70% chocolate, barely any sugar theatre.',
 'Served in glass. Eat cold.',
 'c0000000-0000-4000-8000-000000000006', '{mousse,chocolate}',
 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200', false, false, false, true, true, false,
 'Contains milk. May contain soy.', 'Dark chocolate, cream, sugar.',
 '2 cups', 6, '48 hours', 'Keep chilled.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Dark Chocolate Mousse Cup | Clumsy Cheetah',
 'Eggless dark chocolate mousse.'),

('d0000000-0000-4000-8000-000000000030', 'Almond Financiers', 'almond-financiers', 'PA-FIN-BASE',
 'Beurre noisette, almond, rectangular and smug.',
 'A dozen in a box. Disappears at meetings.',
 'c0000000-0000-4000-8000-000000000002', '{financier,almond,tea}',
 'https://images.unsplash.com/photo-1509366198141-62812ce50c8f?w=1200', false, false, false, true, false, true,
 'Contains egg, almond, milk, wheat.', 'Brown butter, almond flour, egg whites.',
 'Box of 12', 3, '4 days', 'Airtight.',
 'ACTIVE', '{a0000000-0000-4000-8000-000000000001}', 'Almond Financiers | Clumsy Cheetah',
 'Brown butter almond financiers.')
on conflict (id) do nothing;

-- Cake-style weights
insert into public.product_variants (product_id, sku, name, flavour, weight_grams, weight_label, price_paise, compare_at_paise, sort_order, low_stock_threshold)
select x.product_id, x.sku, x.name, x.flavour, x.weight_grams, x.weight_label, x.price_paise, x.compare_at_paise, x.sort_order, 4
from (
  values
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'CK-BCT-500', '500 g', 'Belgian Chocolate', 500, '500 g', 74900, 84900, 1),
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'CK-BCT-1K', '1 kg', 'Belgian Chocolate', 1000, '1 kg', 129900, 149900, 2),
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'CK-BCT-15', '1.5 kg', 'Belgian Chocolate', 1500, '1.5 kg', 179900, 199900, 3),
    ('d0000000-0000-4000-8000-000000000001'::uuid, 'CK-BCT-2K', '2 kg', 'Belgian Chocolate', 2000, '2 kg', 229900, 259900, 4),
    ('d0000000-0000-4000-8000-000000000002'::uuid, 'CK-CRV-500', '500 g', 'Red Velvet', 500, '500 g', 69900, 79900, 1),
    ('d0000000-0000-4000-8000-000000000002'::uuid, 'CK-CRV-1K', '1 kg', 'Red Velvet', 1000, '1 kg', 119900, 139900, 2),
    ('d0000000-0000-4000-8000-000000000002'::uuid, 'CK-CRV-15', '1.5 kg', 'Red Velvet', 1500, '1.5 kg', 164900, 184900, 3),
    ('d0000000-0000-4000-8000-000000000002'::uuid, 'CK-CRV-2K', '2 kg', 'Red Velvet', 2000, '2 kg', 209900, 239900, 4),
    ('d0000000-0000-4000-8000-000000000017'::uuid, 'CK-MPC-500', '500 g', 'Mango Passion', 500, '500 g', 79900, 89900, 1),
    ('d0000000-0000-4000-8000-000000000017'::uuid, 'CK-MPC-1K', '1 kg', 'Mango Passion', 1000, '1 kg', 139900, 159900, 2),
    ('d0000000-0000-4000-8000-000000000017'::uuid, 'CK-MPC-15', '1.5 kg', 'Mango Passion', 1500, '1.5 kg', 189900, null, 3),
    ('d0000000-0000-4000-8000-000000000017'::uuid, 'CK-MPC-2K', '2 kg', 'Mango Passion', 2000, '2 kg', 239900, null, 4),
    ('d0000000-0000-4000-8000-000000000018'::uuid, 'CK-BFC-500', '500 g', 'Black Forest', 500, '500 g', 69900, 79900, 1),
    ('d0000000-0000-4000-8000-000000000018'::uuid, 'CK-BFC-1K', '1 kg', 'Black Forest', 1000, '1 kg', 119900, 139900, 2),
    ('d0000000-0000-4000-8000-000000000018'::uuid, 'CK-BFC-15', '1.5 kg', 'Black Forest', 1500, '1.5 kg', 164900, null, 3),
    ('d0000000-0000-4000-8000-000000000018'::uuid, 'CK-BFC-2K', '2 kg', 'Black Forest', 2000, '2 kg', 209900, null, 4),
    ('d0000000-0000-4000-8000-000000000003'::uuid, 'CH-LBC-8', '8 inch', 'Biscoff', 900, '8 inch', 149900, 169900, 1),
    ('d0000000-0000-4000-8000-000000000003'::uuid, 'CH-LBC-SL', 'Slice', 'Biscoff', 180, 'Slice', 34900, 39900, 2),
    ('d0000000-0000-4000-8000-000000000004'::uuid, 'CH-BLU-8', '8 inch', 'Blueberry', 900, '8 inch', 139900, 154900, 1),
    ('d0000000-0000-4000-8000-000000000004'::uuid, 'CH-BLU-SL', 'Slice', 'Blueberry', 180, 'Slice', 32900, null, 2),
    ('d0000000-0000-4000-8000-000000000015'::uuid, 'CH-VAN-8', '8 inch', 'Vanilla Bean', 900, '8 inch', 129900, null, 1),
    ('d0000000-0000-4000-8000-000000000021'::uuid, 'CH-NYC-9', '9 inch', 'New York', 1100, '9 inch', 159900, 179900, 1),
    ('d0000000-0000-4000-8000-000000000005'::uuid, 'BR-CFB-4', 'Box of 4', 'Dark chocolate', 400, 'Box of 4', 39900, 44900, 1),
    ('d0000000-0000-4000-8000-000000000005'::uuid, 'BR-CFB-9', 'Box of 9', 'Dark chocolate', 900, 'Box of 9', 79900, 89900, 2),
    ('d0000000-0000-4000-8000-000000000006'::uuid, 'BR-NUT-4', 'Box of 4', 'Nutella', 420, 'Box of 4', 44900, null, 1),
    ('d0000000-0000-4000-8000-000000000006'::uuid, 'BR-NUT-9', 'Box of 9', 'Nutella', 940, 'Box of 9', 89900, null, 2),
    ('d0000000-0000-4000-8000-000000000007'::uuid, 'DS-TIR-6', 'Tray (serves 6)', 'Coffee', 700, 'Serves 6', 89900, 99900, 1),
    ('d0000000-0000-4000-8000-000000000008'::uuid, 'PA-ECL-4', 'Box of 4', 'Chocolate', 320, 'Box of 4', 44900, null, 1),
    ('d0000000-0000-4000-8000-000000000009'::uuid, 'PA-FFT-7', '7 inch tart', 'Seasonal fruit', 800, '7 inch', 99900, 114900, 1),
    ('d0000000-0000-4000-8000-000000000010'::uuid, 'BRD-CRO-1', 'Single', 'Butter', 70, '1 pc', 14900, null, 1),
    ('d0000000-0000-4000-8000-000000000010'::uuid, 'BRD-CRO-4', 'Box of 4', 'Butter', 280, '4 pcs', 54900, 59900, 2),
    ('d0000000-0000-4000-8000-000000000011'::uuid, 'BRD-PAC-1', 'Single', 'Dark chocolate', 80, '1 pc', 16900, null, 1),
    ('d0000000-0000-4000-8000-000000000012'::uuid, 'CKI-DCC-6', 'Box of 6', 'Double chocolate', 480, '6 pcs', 44900, 49900, 1),
    ('d0000000-0000-4000-8000-000000000013'::uuid, 'CKI-SSC-6', 'Box of 6', 'Sea salt chocolate', 480, '6 pcs', 44900, 49900, 1),
    ('d0000000-0000-4000-8000-000000000014'::uuid, 'GFT-CELE-1', 'Signature box', 'Assorted', 1200, '1 box', 249900, 279900, 1),
    ('d0000000-0000-4000-8000-000000000016'::uuid, 'PA-OPR-1', 'Slice', 'Coffee-chocolate', 140, '1 slice', 32900, null, 1),
    ('d0000000-0000-4000-8000-000000000019'::uuid, 'BRD-SDL-1', '900 g loaf', 'Country', 900, '900 g', 34900, null, 1),
    ('d0000000-0000-4000-8000-000000000020'::uuid, 'SAV-GCS-1', 'Tray', 'Garlic cheese', 600, '1 tray', 54900, null, 1),
    ('d0000000-0000-4000-8000-000000000022'::uuid, 'PA-MAC-6', 'Box of 6', 'Raspberry', 180, '6 pcs', 59900, 69900, 1),
    ('d0000000-0000-4000-8000-000000000023'::uuid, 'DS-BAN-8', '8 inch pie', 'Banana caramel', 900, '8 inch', 99900, null, 1),
    ('d0000000-0000-4000-8000-000000000024'::uuid, 'DS-BAK-9', 'Box of 9', 'Pistachio', 360, '9 pcs', 74900, null, 1),
    ('d0000000-0000-4000-8000-000000000025'::uuid, 'CK-LOC-1', 'Loaf', 'Lemon', 700, '1 loaf', 79900, 89900, 1),
    ('d0000000-0000-4000-8000-000000000026'::uuid, 'BRD-CIN-4', 'Box of 4', 'Cinnamon', 480, '4 pcs', 49900, null, 1),
    ('d0000000-0000-4000-8000-000000000027'::uuid, 'DS-PAV-6', 'Whole (serves 6)', 'Mixed berry', 650, 'Serves 6', 119900, null, 1),
    ('d0000000-0000-4000-8000-000000000028'::uuid, 'GFT-CORP-24', '24 cookies', 'Assorted', 1600, '24 pcs', 189900, 219900, 1),
    ('d0000000-0000-4000-8000-000000000029'::uuid, 'DS-MOU-2', 'Set of 2 cups', '70% chocolate', 240, '2 cups', 44900, null, 1),
    ('d0000000-0000-4000-8000-000000000030'::uuid, 'PA-FIN-12', 'Box of 12', 'Almond', 360, '12 pcs', 64900, 69900, 1)
) as x(product_id, sku, name, flavour, weight_grams, weight_label, price_paise, compare_at_paise, sort_order)
on conflict (sku) do nothing;

insert into public.product_images (product_id, url, alt, sort_order, is_primary)
select id, thumbnail_url, name, 0, true from public.products
where thumbnail_url is not null
  and not exists (select 1 from public.product_images i where i.product_id = products.id);

insert into public.product_categories (product_id, category_id)
select id, primary_category_id from public.products
where primary_category_id is not null
on conflict do nothing;

insert into public.product_tags (product_id, tag)
select p.id, t
from public.products p
cross join lateral unnest(p.tags) as t
on conflict do nothing;

insert into public.collection_products (collection_id, product_id, sort_order)
values
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 1),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 2),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000003', 3),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000005', 4),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000010', 5),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000013', 6),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000014', 7),
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000021', 8),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000003', 1),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000008', 2),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000009', 3),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000017', 4),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000020', 5),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000026', 6),
  ('b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 1),
  ('b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 2),
  ('b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000018', 3),
  ('b0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000003', 1),
  ('b0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000015', 2),
  ('b0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000009', 1),
  ('b0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000016', 2),
  ('b0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000014', 1),
  ('b0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000017', 1),
  ('b0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000028', 1),
  ('b0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000014', 2),
  ('b0000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000024', 1),
  ('b0000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000013', 1),
  ('b0000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000010', 2)
on conflict do nothing;

insert into public.inventory (location_id, variant_id, on_hand, reserved)
select 'a0000000-0000-4000-8000-000000000001', v.id, 40, 0
from public.product_variants v
on conflict (location_id, variant_id) do nothing;

insert into public.homepage_sections (key, title, subtitle, sort_order, is_visible, config) values
  ('hero', 'Hero', null, 10, true, '{"useBanners": true}'),
  ('categories', 'Shop by Category', 'The case, organised.', 20, true, '{}'),
  ('bestsellers', 'Best Sellers', 'What Mumbai keeps finishing.', 30, true, '{"collectionSlug":"best-sellers"}'),
  ('new-arrivals', 'New Arrivals', 'Still warm in the story, if not the box.', 40, true, '{"collectionSlug":"new-arrivals"}'),
  ('occasions', 'Cakes for Every Occasion', 'Pick the excuse. We will handle the crumb.', 50, true, '{}'),
  ('promo', 'Promotional banner', null, 60, true, '{}'),
  ('testimonials', 'Customer notes', null, 70, true, '{}'),
  ('instagram', 'From the counter', null, 80, true, '{}'),
  ('newsletter', 'Newsletter', null, 90, true, '{}')
on conflict (key) do nothing;

insert into public.banners (title, subtitle, cta_label, cta_href, image_url, placement, sort_order, is_active) values
  ('Cakes with a little chaos', 'Baked in Bandra, delivered the same day when the slot allows.', 'Shop cakes', '/collections/cakes', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1800', 'HERO', 1, true),
  ('Weekend pastry case', 'Croissants, tarts, and the éclair that never lasts till four.', 'See pastries', '/collections/pastries', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1800', 'HERO', 2, true),
  ('Gift like you meant it', 'Hampers with ribbon, not leftover assortment energy.', 'Shop hampers', '/collections/gift-hampers', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600', 'PROMO', 1, true);

insert into public.site_settings (key, value) values
  ('brand', '{"name":"Clumsy Cheetah","tagline":"Serious pastry, slightly clumsy.","city":"Mumbai"}'),
  ('default_location_id', '"a0000000-0000-4000-8000-000000000001"'),
  ('testimonials', '[{"quote":"The truffle cake arrived looking like we spent far more than we did.","name":"Rhea M.","city":"Bandra"},{"quote":"Finally a red velvet that is cocoa, not food colour.","name":"Arjun P.","city":"Khar"},{"quote":"Corporate hamper that people actually fought over.","name":"Meera S.","city":"Lower Parel"}]')
on conflict (key) do nothing;

insert into public.coupons (code, description, coupon_type, percent_off, min_order_paise, max_discount_paise, usage_limit, is_active)
values
  ('WELCOME10', '10% off first web order', 'PERCENTAGE', 10, 79900, 30000, 1000, true),
  ('FREEDEL', 'Free delivery over threshold still applies; this forces fee to 0', 'FREE_DELIVERY', null, 99900, null, 500, true)
on conflict (code) do nothing;
