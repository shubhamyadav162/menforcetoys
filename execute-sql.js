import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

// Direct PostgreSQL connection
const pool = new pg.Pool({
  connectionString: `postgresql://postgres:${dbPassword}@db.ctdakdqpmntycertugvz.supabase.co:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to execute SQL command
async function executeSQL(sql, description) {
  console.log(`\n${description}...`);
  try {
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`✅ Success: ${description}`);
      return true;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      return false;
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

// Main execution function
async function executeRemainingTables() {
  console.log('🚀 Executing remaining e-commerce database schema...');

  try {
    // 8. Create orders table (enhanced version)
    await executeSQL(`
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
    `, 'Creating orders table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `, 'Creating orders indexes');

    // 9. Create order_items table
    await executeSQL(`
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
    `, 'Creating order_items table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
    `, 'Creating order_items indexes');

    // 10. Create payment_transactions table
    await executeSQL(`
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
    `, 'Creating payment_transactions table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
    `, 'Creating payment_transactions indexes');

    // 11. Create product_reviews table
    await executeSQL(`
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
    `, 'Creating product_reviews table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
      CREATE INDEX IF NOT EXISTS idx_product_reviews_order_id ON product_reviews(order_id);
      CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
      CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
    `, 'Creating product_reviews indexes');

    // 12. Create coupons table
    await executeSQL(`
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
    `, 'Creating coupons table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
      CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
      CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
    `, 'Creating coupons indexes');

    // 13. Create shopping_cart table
    await executeSQL(`
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
    `, 'Creating shopping_cart table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_shopping_cart_customer_id ON shopping_cart(customer_id);
      CREATE INDEX IF NOT EXISTS idx_shopping_cart_session_id ON shopping_cart(session_id);
      CREATE INDEX IF NOT EXISTS idx_shopping_cart_product_id ON shopping_cart(product_id);
      CREATE INDEX IF NOT EXISTS idx_shopping_cart_expires_at ON shopping_cart(expires_at);
    `, 'Creating shopping_cart indexes');

    console.log('\n🎉 Database tables creation completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
executeRemainingTables();