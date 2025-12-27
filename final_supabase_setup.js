// Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/qnvdzuiimikcrgpjfier/sql/new

const SQL_TO_RUN = `
-- 1. Create Dropdown Enums (Types) for Status
DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add flat shipping columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_landmark TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10),
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(50) DEFAULT 'India',
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_quantity INTEGER DEFAULT 1;

-- 3. Populate flat columns from JSON data
UPDATE orders SET
    shipping_full_name = full_name,
    shipping_phone = phone,
    shipping_address_line1 = shipping_address->>'address_line_1',
    shipping_address_line2 = shipping_address->>'address_line_2',
    shipping_landmark = shipping_address->>'landmark',
    shipping_city = shipping_address->>'city',
    shipping_state = shipping_address->>'state',
    shipping_pincode = shipping_address->>'pincode',
    product_name = order_items->0->>'product_name',
    product_quantity = (order_items->0->>'quantity')::integer
WHERE shipping_full_name IS NULL;

-- 4. Convert status columns to ENUMs (for Dropdown in Supabase UI)
-- First drop existing checks if any
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Then change column type using USING clause to cast existing text
ALTER TABLE orders 
    ALTER COLUMN status TYPE order_status_enum USING status::order_status_enum,
    ALTER COLUMN payment_status TYPE payment_status_enum USING payment_status::payment_status_enum;

-- 5. Create Easy Export View
DROP VIEW IF EXISTS merchant_orders_view;
CREATE VIEW merchant_orders_view AS
SELECT 
    order_number as "Order ID",
    COALESCE(shipping_full_name, full_name) as "Customer Name",
    COALESCE(shipping_phone, phone) as "Phone",
    COALESCE(shipping_address_line1, shipping_address->>'address_line_1') as "Address",
    COALESCE(shipping_landmark, shipping_address->>'landmark') as "Landmark",
    COALESCE(shipping_city, shipping_address->>'city') as "City",
    COALESCE(shipping_state, shipping_address->>'state') as "State",
    COALESCE(shipping_pincode, shipping_address->>'pincode') as "Pincode",
    COALESCE(product_name, order_items->0->>'product_name') as "Product",
    COALESCE(product_quantity, 1) as "Qty",
    ROUND(total_amount / 100.0, 2) as "Amount (₹)",
    status as "Status",
    payment_status as "Payment Status",
    created_at as "Order Date"
FROM orders
ORDER BY created_at DESC;

GRANT SELECT ON merchant_orders_view TO anon;
GRANT SELECT ON merchant_orders_view TO authenticated;
`;

console.log(SQL_TO_RUN);
