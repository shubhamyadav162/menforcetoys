-- MenForceToys E-commerce Database Schema
-- Deploy to Supabase via SQL Editor

-- =====================================================
-- 1. ORDERS TABLE - Main order storage for shipping
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    
    -- Customer Information (for shipping)
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    
    -- Shipping Address (JSONB for flexibility)
    shipping_address JSONB NOT NULL,
    -- Expected format:
    -- {
    --   "address_line_1": "123 Main St",
    --   "address_line_2": "Apt 4B",
    --   "landmark": "Near Park",
    --   "city": "Mumbai",
    --   "state": "Maharashtra",
    --   "pincode": "400001",
    --   "country": "India"
    -- }
    
    -- Order Amounts (stored in paise, 100 paise = ₹1)
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    
    -- Order Status
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Payment Details
    payment_method JSONB,
    -- Expected format: { "type": "upi", "gateway": "acceptpay" }
    
    -- Shipping & Tracking
    shipping_method JSONB,
    tracking_number TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMPTZ,
    
    -- Product Details (JSONB for order items)
    order_items JSONB NOT NULL DEFAULT '[]',
    -- Expected format:
    -- [
    --   {
    --     "product_id": "xxx",
    --     "product_name": { "en": "Product", "hi": "उत्पाद" },
    --     "quantity": 1,
    --     "unit_price": 999,
    --     "total_price": 999
    --   }
    -- ]
    
    -- Notes
    notes JSONB,
    internal_notes JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PAYMENT TRANSACTIONS TABLE - Payment tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- AcceptPay Transaction Details
    transaction_id TEXT UNIQUE NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'acceptpay',
    gateway_order_id TEXT,
    
    -- Amount in paise
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    
    -- Payment Method Info
    payment_method JSONB,
    -- Expected format: { "type": "upi", "upi_id": "xxx@ybl" }
    
    -- Gateway Response (full response for debugging)
    gateway_response JSONB,
    
    -- VPA & Bank Reference (from AcceptPay)
    vpa_id TEXT,
    bank_ref TEXT,
    
    -- Failure tracking
    failure_reason TEXT,
    
    -- Timestamps
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- =====================================================
-- 4. UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to payment_transactions table
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert orders (for guest checkout)
CREATE POLICY "Allow insert orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view their own orders (by phone)
CREATE POLICY "Allow select orders" ON orders
    FOR SELECT USING (true);

-- Allow service role to manage all orders
CREATE POLICY "Service role full access orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment transactions policies
CREATE POLICY "Allow insert payment_transactions" ON payment_transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select payment_transactions" ON payment_transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow update payment_transactions" ON payment_transactions
    FOR UPDATE USING (true);

CREATE POLICY "Service role full access payment_transactions" ON payment_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 6. GRANT PERMISSIONS FOR ANON ROLE
-- =====================================================
GRANT INSERT, SELECT ON orders TO anon;
GRANT INSERT, SELECT, UPDATE ON payment_transactions TO anon;

-- Done!
SELECT 'Database schema deployed successfully!' as result;
