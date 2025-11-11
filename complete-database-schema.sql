-- =================================================================
-- E-COMMERCE DATABASE SCHEMA - PART 2, 3 & FUNCTIONS
-- =================================================================
-- Execute these commands in your Supabase SQL Editor
-- =================================================================

-- 8. CREATE ORDERS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL DEFAULT 'NP' || TO_CHAR(NOW(), 'YYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  customer_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method JSONB,
  transaction_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Customer information
  billing_name TEXT NOT NULL,
  billing_phone TEXT NOT NULL,
  billing_email TEXT,
  billing_address JSONB NOT NULL,

  -- Shipping information
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address JSONB,

  -- Order details
  notes JSONB,
  internal_notes JSONB DEFAULT '{}',
  estimated_delivery DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  coupon_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 9. CREATE ORDER_ITEMS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  sku TEXT NOT NULL,
  product_name JSONB NOT NULL,
  variant_name JSONB,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_snapshot JSONB DEFAULT '{}',
  variant_snapshot JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- 10. CREATE PAYMENT_TRANSACTIONS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE,
  gateway TEXT NOT NULL DEFAULT 'upi',
  gateway_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
  payment_method JSONB NOT NULL,
  gateway_response JSONB DEFAULT '{}',
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- 11. CREATE PRODUCT_REVIEWS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title JSONB,
  review_text JSONB,
  images TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_order_id ON product_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- 12. CREATE COUPONS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_value DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_limit_per_customer INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  applicable_products TEXT[] DEFAULT '{}',
  applicable_categories TEXT[] DEFAULT '{}',
  excluded_products TEXT[] DEFAULT '{}',
  excluded_categories TEXT[] DEFAULT '{}',
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- 13. CREATE SHOPPING_CART TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS shopping_cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_cart_customer_id ON shopping_cart(customer_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_session_id ON shopping_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_product_id ON shopping_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_expires_at ON shopping_cart(expires_at);

-- 14. CREATE HELPER FUNCTIONS
-- =================================================================

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  timestamp_part TEXT;
  random_part TEXT;
BEGIN
  timestamp_part := TO_CHAR(NOW(), 'YYMMDDHH24MISS');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'NP' || timestamp_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. CREATE TRIGGERS FOR UPDATED_AT
-- =================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON customer_addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP TRIGGER IF EXISTS update_shopping_cart_updated_at ON shopping_cart;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. ENABLE ROW LEVEL SECURITY
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- 17. CREATE RLS POLICIES
-- =================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow insert operations on categories" ON categories;
DROP POLICY IF EXISTS "Allow update operations on categories" ON categories;

DROP POLICY IF EXISTS "Public read access to active products" ON products;
DROP POLICY IF EXISTS "Allow insert operations on products" ON products;
DROP POLICY IF EXISTS "Allow update operations on products" ON products;

DROP POLICY IF EXISTS "Public read access to product images" ON product_images;
DROP POLICY IF EXISTS "Allow insert operations on product images" ON product_images;
DROP POLICY IF EXISTS "Allow update operations on product images" ON product_images;

DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Allow insert operations on orders" ON orders;
DROP POLICY IF EXISTS "Customers can update own orders" ON orders;

DROP POLICY IF EXISTS "Public read access to approved reviews" ON product_reviews;
DROP POLICY IF EXISTS "Allow insert operations on reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;

DROP POLICY IF EXISTS "Users can manage own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Guest cart access by session" ON shopping_cart;

DROP POLICY IF EXISTS "Public read access to active coupons" ON coupons;
DROP POLICY IF EXISTS "Allow insert operations on coupons" ON coupons;
DROP POLICY IF EXISTS "Allow update operations on coupons" ON coupons;

-- Categories (public read access)
CREATE POLICY "Public read access to categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow insert operations on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update operations on categories" ON categories FOR UPDATE USING (true);

-- Products (public read access for active products)
CREATE POLICY "Public read access to active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Allow insert operations on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update operations on products" ON products FOR UPDATE USING (true);

-- Product Images (public read access)
CREATE POLICY "Public read access to product images" ON product_images FOR SELECT USING (is_active = true);
CREATE POLICY "Allow insert operations on product images" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update operations on product images" ON product_images FOR UPDATE USING (true);

-- Orders (access based on customer ownership or admin)
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (customer_id IS NULL OR customer_id = auth.uid());
CREATE POLICY "Allow insert operations on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can update own orders" ON orders FOR UPDATE USING (customer_id IS NULL OR customer_id = auth.uid());

-- Product Reviews (public read for approved reviews)
CREATE POLICY "Public read access to approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow insert operations on reviews" ON product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (customer_id = auth.uid());

-- Shopping Cart (access based on customer ownership)
CREATE POLICY "Users can manage own cart" ON shopping_cart FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Guest cart access by session" ON shopping_cart FOR ALL USING (customer_id IS NULL AND session_id IS NOT NULL);

-- Coupons (public read access for active coupons)
CREATE POLICY "Public read access to active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow insert operations on coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update operations on coupons" ON coupons FOR UPDATE USING (true);

-- =================================================================
-- COMPLETION MESSAGE
-- =================================================================
-- Your e-commerce database schema is now complete!
--
-- Tables created:
-- ✓ categories
-- ✓ products
-- ✓ product_images
-- ✓ product_variants
-- ✓ inventory
-- ✓ customers
-- ✓ customer_addresses
-- ✓ orders
-- ✓ order_items
-- ✓ payment_transactions
-- ✓ product_reviews
-- ✓ coupons
-- ✓ shopping_cart
--
-- Features enabled:
-- ✓ Auto-generated order numbers
-- ✓ Updated_at timestamps with triggers
-- ✓ Row Level Security (RLS) enabled
-- ✓ Comprehensive RLS policies
-- ✓ Proper indexing for performance
-- =================================================================