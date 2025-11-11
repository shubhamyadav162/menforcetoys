# NP Wellness Store - Complete E-commerce Database Schema
# Generated using Supabase MCP Server

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE - Customer management with authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}', -- Language preferences, communication preferences
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE - Product categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name JSONB NOT NULL, -- { "en": "Toys", "hi": "खिलौने" }
    slug TEXT UNIQUE NOT NULL,
    description JSONB,
    image_url TEXT,
    icon TEXT, -- Icon name or emoji
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title JSONB,
    meta_description JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS TABLE - Enhanced product management
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id),
    sku TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL, -- { "en": "Product Name", "hi": "उत्पाद नाम" }
    description JSONB,
    short_description JSONB,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2), -- MRP/discount price
    cost_price DECIMAL(10,2), -- For profit tracking
    weight DECIMAL(8,3), -- in grams
    dimensions JSONB, -- { "length": 10, "width": 5, "height": 3, "unit": "cm" }
    materials JSONB, -- { "en": ["Silicone", "ABS Plastic"], "hi": ["सिलिकॉन", "एबीएस प्लास्टिक"] }
    features JSONB, -- Array of features
    tags TEXT[], -- Search tags
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    is_discreet BOOLEAN DEFAULT true, -- For discreet billing
    requires_age_verification BOOLEAN DEFAULT false,
    seo_title JSONB,
    seo_description JSONB,
    meta_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCT IMAGES TABLE - Multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text JSONB, -- { "en": "Product view", "hi": "उत्पाद दृश्य" }
    image_type TEXT DEFAULT 'main' CHECK (image_type IN ('main', 'gallery', 'thumbnail', 'lifestyle')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS TABLE - Size/color variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name JSONB, -- { "en": "Medium - Blue", "hi": "मध्यम - नीला" }
    variant_type JSONB, -- { "color": "blue", "size": "medium" }
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    weight DECIMAL(8,3),
    barcode TEXT,
    inventory_tracking BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INVENTORY TABLE - Stock management
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0), -- For pending orders
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    reorder_level INTEGER DEFAULT 5, -- Alert when stock gets low
    reorder_quantity INTEGER DEFAULT 20, -- Quantity to reorder
    cost_per_unit DECIMAL(10,2),
    location TEXT, -- Warehouse/bin location
    batch_number TEXT,
    expiry_date DATE,
    last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_product_or_variant CHECK (
        (product_id IS NOT NULL AND variant_id IS NULL) OR
        (product_id IS NULL AND variant_id IS NOT NULL)
    )
);

-- 7. SHIPPING ADDRESSES TABLE - Customer address book
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    special_instructions JSONB, -- { "en": "Leave at door", "hi": "दरवाजे पर छोड़ें" }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SHOPPING CART TABLE - Persistent cart functionality
CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL, -- Price at time of adding to cart
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

-- 9. ORDERS TABLE - Enhanced orders with proper relationships
-- Maintain existing structure but add foreign key relationships
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

    -- Order totals
    subtotal INTEGER NOT NULL, -- in paise (₹100 = 10000 paise)
    shipping_cost INTEGER NOT NULL DEFAULT 50, -- in paise
    tax_amount INTEGER NOT NULL DEFAULT 0, -- in paise
    discount_amount INTEGER NOT NULL DEFAULT 0, -- in paise
    total_amount INTEGER NOT NULL, -- in paise

    -- Order status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),

    -- Payment details
    payment_method JSONB, -- { "type": "upi", "upi_id": "xxx@ybl", "transaction_id": "T12345" }
    payment_details JSONB, -- Additional payment information

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

-- 10. ORDER ITEMS TABLE - Multiple items per order
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders_new(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    product_name JSONB NOT NULL,
    variant_name JSONB,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL, -- in paise, price at time of order
    total_price INTEGER NOT NULL, -- in paise
    product_snapshot JSONB, -- Complete product data snapshot for order history
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PAYMENT TRANSACTIONS TABLE - Payment tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders_new(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL, -- Gateway transaction ID
    gateway TEXT NOT NULL, -- 'upi', 'razorpay', 'phonepe', etc.
    gateway_order_id TEXT, -- Order ID from payment gateway
    amount INTEGER NOT NULL, -- in paise
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    payment_method JSONB, -- { "type": "upi", "upi_id": "xxx@ybl" }
    gateway_response JSONB, -- Full response from payment gateway
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. PRODUCT REVIEWS TABLE - Customer ratings and reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders_new(id) ON DELETE SET NULL, -- Only allow verified purchases
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title JSONB, -- Review title in multiple languages
    review_text JSONB, -- Review content in multiple languages
    images TEXT[], -- Review images
    helpful_count INTEGER DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true, -- For moderation
    is_anonymous BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_verified_review UNIQUE (product_id, user_id, order_id) -- One review per order
);

-- 13. COUPONS TABLE - Discount management
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name JSONB NOT NULL, -- { "en": "Welcome Offer", "hi": "स्वागत ऑफर" }
    description JSONB,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_order_value DECIMAL(10,2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10,2), -- For percentage discounts
    usage_limit INTEGER, -- Total usage limit
    usage_limit_per_customer INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    applicable_products TEXT[], -- Specific product SKUs, empty for all
    applicable_categories TEXT[], -- Category slugs, empty for all
    excluded_products TEXT[],
    excluded_categories TEXT[],
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_type ON product_images(image_type);
CREATE INDEX IF NOT EXISTS idx_product_images_active ON product_images(is_active);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity);

-- Shopping cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON shopping_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON shopping_cart(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_variant ON shopping_cart(variant_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders_new(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders_new(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders_new(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders_new(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders_new(phone);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders_new(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON payment_transactions(gateway);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON product_reviews(is_verified_purchase);

-- Coupons indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(starts_at, expires_at);

-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_new_updated_at BEFORE UPDATE ON orders_new FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Users table RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can insert users (for signup)" ON users FOR INSERT WITH CHECK (true);

-- Categories table RLS policies - Public read access
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Products table RLS policies - Public read access for active products
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Product images table RLS policies
CREATE POLICY "Public can view active product images" ON product_images FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage product images" ON product_images FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Product variants table RLS policies
CREATE POLICY "Public can view active product variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage product variants" ON product_variants FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Inventory table RLS policies
CREATE POLICY "Service role full access to inventory" ON inventory FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Shopping cart table RLS policies
CREATE POLICY "Users can manage own cart" ON shopping_cart FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Guests can manage session cart" ON shopping_cart FOR ALL USING (session_id IS NOT NULL);

-- Shipping addresses table RLS policies
CREATE POLICY "Users can manage own addresses" ON shipping_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage addresses" ON shipping_addresses FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Orders table RLS policies
CREATE POLICY "Users can view own orders" ON orders_new FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all orders" ON orders_new FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Order items table RLS policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders_new o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Service role can manage order items" ON order_items FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Payment transactions table RLS policies
CREATE POLICY "Users can view own payment transactions" ON payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders_new o WHERE o.id = payment_transactions.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Service role can manage payment transactions" ON payment_transactions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Product reviews table RLS policies
CREATE POLICY "Public can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON product_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage reviews" ON product_reviews FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Coupons table RLS policies
CREATE POLICY "Public can view active coupons" ON coupons FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at >= NOW()));
CREATE POLICY "Service role can manage coupons" ON coupons FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ADDITIONAL HELPER FUNCTIONS

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

-- Function to update product rating and review count
CREATE OR REPLACE FUNCTION update_product_rating(product_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET
        rating = COALESCE(AVG(rating), 0),
        review_count = COUNT(*)
    FROM product_reviews
    WHERE product_reviews.product_id = products.id
    AND product_reviews.is_approved = true
    AND products.id = product_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_product_rating(NEW.product_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_product_rating(OLD.product_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_update_product_rating();

-- Function to create order from cart
CREATE OR REPLACE FUNCTION create_order_from_cart(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_payment_method JSONB,
    p_shipping_method JSONB,
    p_coupon_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    order_id_val UUID;
    cart_items RECORD;
    total_subtotal INTEGER;
    total_shipping INTEGER;
    total_amount INTEGER;
    discount_amount_val INTEGER DEFAULT 0;
    coupon_record coupons%ROWTYPE;
BEGIN
    -- Validate cart has items
    IF NOT EXISTS (SELECT 1 FROM shopping_cart WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'Cart is empty';
    END IF;

    -- Calculate totals
    SELECT COALESCE(SUM(total_price), 0), COUNT(*)
    INTO total_subtotal
    FROM shopping_cart
    WHERE user_id = p_user_id;

    -- Calculate shipping (simplified - could be more complex)
    total_shipping := CASE WHEN total_subtotal >= 50000 THEN 0 ELSE 5000 END; -- Free shipping over ₹500

    -- Apply coupon if provided
    IF p_coupon_code IS NOT NULL THEN
        SELECT * INTO coupon_record FROM coupons
        WHERE code = UPPER(p_coupon_code)
        AND is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at >= NOW());

        IF coupon_record.id IS NOT NULL THEN
            IF coupon_record.minimum_order_value IS NOT NULL AND total_subtotal < coupon_record.minimum_order_value * 100 THEN
                RAISE EXCEPTION 'Minimum order value not met for coupon';
            END IF;

            IF coupon_record.discount_type = 'percentage' THEN
                discount_amount_val := FLOOR(total_subtotal * (coupon_record.discount_value / 100));
                IF coupon_record.maximum_discount_amount IS NOT NULL THEN
                    discount_amount_val := LEAST(discount_amount_val, coupon_record.maximum_discount_amount * 100);
                END IF;
            ELSIF coupon_record.discount_type = 'fixed_amount' THEN
                discount_amount_val := coupon_record.discount_value * 100;
            ELSIF coupon_record.discount_type = 'free_shipping' THEN
                discount_amount_val := total_shipping;
            END IF;

            -- Update coupon usage
            UPDATE coupons SET usage_count = usage_count + 1 WHERE id = coupon_record.id;
        END IF;
    END IF;

    total_amount := total_subtotal + total_shipping - discount_amount_val;

    -- Create order
    INSERT INTO orders_new (
        order_number,
        user_id,
        shipping_address,
        subtotal,
        shipping_cost,
        discount_amount,
        total_amount,
        payment_method,
        shipping_method,
        coupon_id,
        status,
        payment_status
    ) VALUES (
        generate_order_number(),
        p_user_id,
        p_shipping_address,
        total_subtotal,
        total_shipping,
        discount_amount_val,
        total_amount,
        p_payment_method,
        p_shipping_method,
        coupon_record.id,
        'pending',
        'pending'
    ) RETURNING id INTO order_id_val;

    -- Create order items from cart
    FOR cart_items IN
        SELECT sc.*, p.name, p.sku
        FROM shopping_cart sc
        JOIN products p ON sc.product_id = p.id
        WHERE sc.user_id = p_user_id
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            sku,
            product_name,
            quantity,
            unit_price,
            total_price,
            product_snapshot
        ) VALUES (
            order_id_val,
            cart_items.product_id,
            cart_items.variant_id,
            cart_items.sku,
            cart_items.name,
            cart_items.quantity,
            cart_items.unit_price * 100, -- Convert to paise
            cart_items.total_price * 100,
            jsonb_build_object(
                'name', cart_items.name,
                'sku', cart_items.sku
            )
        );
    END LOOP;

    -- Clear cart
    DELETE FROM shopping_cart WHERE user_id = p_user_id;

    RETURN order_id_val;
END;
$$ LANGUAGE plpgsql;

COMMIT;