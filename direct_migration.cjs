const { Client } = require('pg');
require('dotenv').config();

// Database configuration from environment
const dbConfig = {
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ctdakdqpmntycertugvz',
  password: process.env.SUPABASE_DB_PASSWORD || 'Sextoy@2025',
  ssl: {
    rejectUnauthorized: false
  }
};

// Your complete migration script
const migrationSQL = `
-- Create users table first (required by orders table)
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
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE,

    -- Customer information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,

    -- Shipping address (JSON format for flexibility)
    shipping_address JSONB NOT NULL,

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
    payment_method JSONB,
    payment_details JSONB,
    payment_transaction_id UUID REFERENCES payment_transactions(id),

    -- Shipping details
    shipping_method JSONB,
    tracking_number TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,

    -- Additional fields
    notes JSONB,
    internal_notes JSONB,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
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

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE,
    gateway TEXT NOT NULL DEFAULT 'toys4peace',
    gateway_order_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    payment_method JSONB,
    gateway_response JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON payment_transactions(gateway);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can insert users" ON users;
CREATE POLICY "Public can insert users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all orders" ON orders;
CREATE POLICY "Service role can manage all orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Service role can manage order items" ON order_items;
CREATE POLICY "Service role can manage order items" ON order_items FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions" ON payment_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = payment_transactions.order_id AND o.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Service role can manage payment transactions" ON payment_transactions;
CREATE POLICY "Service role can manage payment transactions" ON payment_transactions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique order numbers
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
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
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE;

    RETURN 'NP-' || date_part || '-' || COALESCE(sequence_part, '001');
END;
$$ LANGUAGE plpgsql;
`;

async function executeMigration() {
  const client = new Client(dbConfig);

  console.log('🎯 Starting NP Wellness Store database migration...');
  console.log(`📍 Target Database: ${dbConfig.database}`);
  console.log(`📍 Host: ${dbConfig.host}:${dbConfig.port}`);

  try {
    console.log('\n🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Database connection established');

    console.log('\n📊 Executing migration script...');

    // Execute the complete migration
    await client.query(migrationSQL);

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ All tables, indexes, RLS policies, triggers, and functions have been created');

    // Verify tables were created
    console.log('\n🔍 Verifying created tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'orders', 'order_items', 'payment_transactions')
      ORDER BY table_name
    `);

    console.log('✅ Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🚀 Your NP Wellness Store database is now ready!');
    console.log('📋 Features included:');
    console.log('   - User management with authentication support');
    console.log('   - Comprehensive order management system');
    console.log('   - Order items with product references');
    console.log('   - Payment transaction tracking (Toys4Peace integration)');
    console.log('   - Row Level Security (RLS) policies');
    console.log('   - Performance indexes');
    console.log('   - Automatic timestamps via triggers');
    console.log('   - Order number generation function');

    console.log('\n🔗 Database URL: https://app.supabase.com/project/ctdakdqpmntycertugvz');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.code === '28P01') {
      console.error('\n🔐 Authentication failed. Please check your database credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n🌐 Connection refused. Please check your network and database settings.');
    } else if (error.code === '3D000') {
      console.error('\n📁 Database does not exist. Please check your database name.');
    }

    process.exit(1);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await client.end();
    console.log('✅ Connection closed');
  }
}

// Execute the migration
executeMigration();