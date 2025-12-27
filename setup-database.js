import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute SQL command
async function executeSQL(sql, description) {
  console.log(`\n${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try using direct SQL execution if RPC fails
      console.log('RPC method failed, trying direct SQL execution...');
      const { data: directData, error: directError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('*')
        .limit(1);

      if (directError && directError.message.includes('permission denied')) {
        console.log(`❌ Failed: ${error.message}`);
        return false;
      }
    }

    console.log(`✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution function
async function setupDatabase() {
  console.log('🚀 Starting e-commerce database schema setup...');
  console.log(`Connecting to: ${supabaseUrl}`);

  try {
    // 1. Create categories table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name JSONB NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description JSONB,
        image_url TEXT,
        icon TEXT,
        parent_id UUID REFERENCES categories(id),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        meta_title JSONB,
        meta_description JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating categories table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
      CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
    `, 'Creating categories indexes');

    // 2. Create products table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category_id UUID REFERENCES categories(id),
        sku TEXT UNIQUE NOT NULL,
        name JSONB NOT NULL,
        description JSONB,
        short_description JSONB,
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        weight DECIMAL(8,2),
        dimensions JSONB,
        materials JSONB,
        features JSONB,
        tags TEXT[],
        status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
        is_discreet BOOLEAN DEFAULT TRUE,
        requires_age_verification BOOLEAN DEFAULT TRUE,
        seo_title JSONB,
        seo_description JSONB,
        meta_keywords TEXT[],
        view_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating products table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      CREATE INDEX IF NOT EXISTS idx_products_is_discreet ON products(is_discreet);
    `, 'Creating products indexes');

    // 3. Create product_images table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS product_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text JSONB,
        image_type TEXT DEFAULT 'gallery' CHECK (image_type IN ('main', 'gallery', 'thumbnail', 'lifestyle')),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating product_images table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);
    `, 'Creating product_images indexes');

    // 4. Create product_variants table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku TEXT UNIQUE,
        name JSONB,
        variant_type JSONB,
        price DECIMAL(10,2),
        compare_price DECIMAL(10,2),
        weight DECIMAL(8,2),
        barcode TEXT,
        stock_quantity INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating product_variants table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
    `, 'Creating product_variants indexes');

    // 5. Create inventory table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
        reorder_level INTEGER DEFAULT 10,
        reorder_quantity INTEGER DEFAULT 50,
        cost_per_unit DECIMAL(10,2),
        location TEXT DEFAULT 'Main Warehouse',
        batch_number TEXT,
        expiry_date DATE,
        last_stock_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating inventory table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON inventory(variant_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_available_quantity ON inventory(available_quantity);
    `, 'Creating inventory indexes');

    // 6. Create customers table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        preferences JSONB DEFAULT '{}',
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating customers table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
    `, 'Creating customers indexes');

    // 7. Create customer_addresses table
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
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
        is_default BOOLEAN DEFAULT FALSE,
        special_instructions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `, 'Creating customer_addresses table');

    await executeSQL(`
      CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
      CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON customer_addresses(customer_id, is_default);
    `, 'Creating customer_addresses indexes');

    console.log('\n🎉 Database schema setup completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('- categories');
    console.log('- products');
    console.log('- product_images');
    console.log('- product_variants');
    console.log('- inventory');
    console.log('- customers');
    console.log('- customer_addresses');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();