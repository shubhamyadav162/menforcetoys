-- Enhanced Orders table to replace the existing orders table
-- This maintains existing structure while adding proper relationships

-- First backup existing data (if any orders exist)
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- Create the new enhanced orders table
CREATE TABLE IF NOT EXISTS orders_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Format: NP-20251108-001

    -- Customer information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,

    -- Shipping address
    shipping_address JSONB NOT NULL, -- Complete address object

    -- Order totals (in paise for precision - ₹100 = 10000 paise)
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL DEFAULT 50,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,

    -- Order status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),

    -- Payment details
    payment_method JSONB, -- { "type": "upi", "upi_id": "xxx@ybl", "transaction_id": "T12345" }
    payment_details JSONB,

    -- Shipping details
    shipping_method JSONB, -- { "type": "standard", "name": "Standard Delivery", "days": "3-5", "cost": 50 }
    tracking_number TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Additional fields
    notes JSONB, -- Customer notes or special instructions
    internal_notes JSONB, -- Admin notes
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders_new(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders_new(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders_new(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders_new(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders_new(phone);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders_new(order_number);

-- Enable Row Level Security
ALTER TABLE orders_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orders" ON orders_new FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all orders" ON orders_new FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_orders_new_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_new_updated_at BEFORE UPDATE ON orders_new FOR EACH ROW EXECUTE FUNCTION update_orders_new_updated_at();

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    sequence_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');

    -- Get today's order count and increment
    SELECT LPAD((COUNT(*) + 1)::TEXT, 3, '0')
    INTO sequence_part
    FROM orders_new
    WHERE DATE(created_at) = CURRENT_DATE;

    RETURN 'NP-' || date_part || '-' || COALESCE(sequence_part, '001');
END;
$$ LANGUAGE plpgsql;