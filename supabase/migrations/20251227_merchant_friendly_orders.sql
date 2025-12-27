-- Migration to add flat shipping address columns for easy merchant view
-- This makes the data easily exportable and readable

-- Add flat shipping columns to orders table (keeping JSONB as backup)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_landmark TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10),
ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(50) DEFAULT 'India';

-- Add product info columns for easy reading
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_quantity INTEGER DEFAULT 1;

-- Create a view for merchants that is easy to understand and export
CREATE OR REPLACE VIEW merchant_orders_view AS
SELECT 
    id,
    order_number,
    -- Customer Info
    COALESCE(shipping_full_name, full_name) as customer_name,
    COALESCE(shipping_phone, phone) as customer_phone,
    email as customer_email,
    -- Shipping Address (easy to read)
    COALESCE(shipping_address_line1, shipping_address->>'address_line_1') as address_line_1,
    COALESCE(shipping_address_line2, shipping_address->>'address_line_2') as address_line_2,
    COALESCE(shipping_landmark, shipping_address->>'landmark') as landmark,
    COALESCE(shipping_city, shipping_address->>'city') as city,
    COALESCE(shipping_state, shipping_address->>'state') as state,
    COALESCE(shipping_pincode, shipping_address->>'pincode') as pincode,
    'India' as country,
    -- Product Info
    COALESCE(product_name, order_items->0->>'product_name') as product_ordered,
    COALESCE(product_quantity, (order_items->0->>'quantity')::integer) as quantity,
    -- Amount Info (converted from paise to rupees)
    ROUND(total_amount / 100.0, 2) as amount_rupees,
    -- Order Status
    status as order_status,
    payment_status,
    -- Timestamps
    created_at as order_date,
    updated_at
FROM orders
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON merchant_orders_view TO anon;
GRANT SELECT ON merchant_orders_view TO authenticated;

-- Update existing orders to populate flat columns (one-time data migration)
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

-- Add comment to explain the view
COMMENT ON VIEW merchant_orders_view IS 'Easy-to-read view for merchants to see and export orders with all shipping details in flat columns';
