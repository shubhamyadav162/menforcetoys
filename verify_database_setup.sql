-- Database Verification Script
-- Run this after completing the setup to verify everything is working correctly

-- 1. Check if all tables exist
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'categories', 'products', 'product_images',
        'product_variants', 'inventory', 'shopping_cart',
        'orders_new', 'order_items', 'payment_transactions',
        'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY table_name;

-- 2. Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN (
        'users', 'categories', 'products', 'product_images',
        'product_variants', 'inventory', 'shopping_cart',
        'orders_new', 'order_items', 'payment_transactions',
        'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY tc.table_name, tc.constraint_name;

-- 3. Check indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'categories', 'products', 'product_images',
        'product_variants', 'inventory', 'shopping_cart',
        'orders_new', 'order_items', 'payment_transactions',
        'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY tablename, indexname;

-- 4. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'categories', 'products', 'product_images',
        'product_variants', 'inventory', 'shopping_cart',
        'orders_new', 'order_items', 'payment_transactions',
        'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY tablename, policyname;

-- 5. Check triggers
SELECT
    event_object_table,
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND event_object_table IN (
        'users', 'categories', 'products', 'product_variants',
        'inventory', 'shopping_cart', 'orders_new', 'order_items',
        'payment_transactions', 'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY event_object_table, trigger_name;

-- 6. Test basic functionality with sample data (optional)
-- Uncomment to test with sample data

/*
-- Sample Category
INSERT INTO categories (name, slug, description, is_active) VALUES
('{"en": "Vibrators", "hi": "वाइब्रेटर"}', 'vibrators', '{"en": "Various types of vibrators", "hi": "विभिन्न प्रकार के वाइब्रेटर"}', true)
ON CONFLICT (slug) DO NOTHING;

-- Sample Product
INSERT INTO products (category_id, sku, name, description, price, status) VALUES
(
    (SELECT id FROM categories WHERE slug = 'vibrators' LIMIT 1),
    'VIB-001',
    '{"en": "Magic Wand Vibrator", "hi": "मैजिक वैंड वाइब्रेटर"}',
    '{"en": "Powerful wand vibrator with multiple speeds", "hi": "कई स्पीड के साथ शक्तिशाली वैंड वाइब्रेटर"}',
    2999.00,
    'active'
) ON CONFLICT (sku) DO NOTHING;

-- Sample Coupon
INSERT INTO coupons (code, name, discount_type, discount_value, is_active) VALUES
('WELCOME20', '{"en": "Welcome Offer", "hi": "स्वागत ऑफर"}', 'percentage', 20.00, true)
ON CONFLICT (code) DO NOTHING;
*/

-- 7. Check if sample data was created (if you ran the above)
-- SELECT * FROM categories LIMIT 3;
-- SELECT * FROM products LIMIT 3;
-- SELECT * FROM coupons LIMIT 3;

-- 8. Row count for each table
SELECT
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'categories', 'products', 'product_images',
        'product_variants', 'inventory', 'shopping_cart',
        'orders_new', 'order_items', 'payment_transactions',
        'shipping_addresses', 'product_reviews', 'coupons'
    )
ORDER BY tablename;

COMMIT;