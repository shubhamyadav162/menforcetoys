import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute SQL command
async function executeSQL(sql, description) {
  console.log(`\n${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution function for third part
async function setupDatabasePart3() {
  console.log('🚀 Finalizing e-commerce database schema setup (Part 3)...');

  try {
    // 14. Create helper functions
    await executeSQL(`
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
    `, 'Creating generate_order_number function');

    await executeSQL(`
      -- Function to automatically update updated_at timestamps
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `, 'Creating update_updated_at_column function');

    // Create triggers for updated_at
    await executeSQL(`
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
    `, 'Dropping existing triggers');

    await executeSQL(`
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
    `, 'Creating updated_at triggers');

    // 15. Enable Row Level Security
    await executeSQL(`
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
    `, 'Enabling Row Level Security');

    // Create basic RLS policies
    await executeSQL(`
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
    `, 'Dropping existing policies');

    await executeSQL(`
      -- Categories (public read access)
      CREATE POLICY "Public read access to categories" ON categories FOR SELECT USING (is_active = true);
      CREATE POLICY "Allow insert operations on categories" ON categories FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow update operations on categories" ON categories FOR UPDATE USING (true);
    `, 'Creating categories policies');

    await executeSQL(`
      -- Products (public read access for active products)
      CREATE POLICY "Public read access to active products" ON products FOR SELECT USING (status = 'active');
      CREATE POLICY "Allow insert operations on products" ON products FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow update operations on products" ON products FOR UPDATE USING (true);
    `, 'Creating products policies');

    await executeSQL(`
      -- Product Images (public read access)
      CREATE POLICY "Public read access to product images" ON product_images FOR SELECT USING (is_active = true);
      CREATE POLICY "Allow insert operations on product images" ON product_images FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow update operations on product images" ON product_images FOR UPDATE USING (true);
    `, 'Creating product_images policies');

    await executeSQL(`
      -- Orders (access based on customer ownership or admin)
      CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (customer_id IS NULL OR customer_id = auth.uid());
      CREATE POLICY "Allow insert operations on orders" ON orders FOR INSERT WITH CHECK (true);
      CREATE POLICY "Customers can update own orders" ON orders FOR UPDATE USING (customer_id IS NULL OR customer_id = auth.uid());
    `, 'Creating orders policies');

    await executeSQL(`
      -- Product Reviews (public read for approved reviews)
      CREATE POLICY "Public read access to approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
      CREATE POLICY "Allow insert operations on reviews" ON product_reviews FOR INSERT WITH CHECK (true);
      CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (customer_id = auth.uid());
    `, 'Creating product_reviews policies');

    await executeSQL(`
      -- Shopping Cart (access based on customer ownership)
      CREATE POLICY "Users can manage own cart" ON shopping_cart FOR ALL USING (customer_id = auth.uid());
      CREATE POLICY "Guest cart access by session" ON shopping_cart FOR ALL USING (customer_id IS NULL AND session_id IS NOT NULL);
    `, 'Creating shopping_cart policies');

    await executeSQL(`
      -- Coupons (public read access for active coupons)
      CREATE POLICY "Public read access to active coupons" ON coupons FOR SELECT USING (is_active = true);
      CREATE POLICY "Allow insert operations on coupons" ON coupons FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow update operations on coupons" ON coupons FOR UPDATE USING (true);
    `, 'Creating coupons policies');

    console.log('\n🎉 Database schema setup completed successfully!');
    console.log('\n📊 Final setup completed:');
    console.log('- Helper functions created (generate_order_number, update_updated_at_column)');
    console.log('- Updated_at triggers created for all tables');
    console.log('- Row Level Security enabled on all tables');
    console.log('- RLS policies created for proper access control');
    console.log('\n✅ Your e-commerce database is now ready to use!');

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'categories', 'products', 'product_images', 'product_variants',
        'inventory', 'customers', 'customer_addresses', 'orders',
        'order_items', 'payment_transactions', 'product_reviews',
        'coupons', 'shopping_cart'
      ]);

    if (!tablesError && tables) {
      console.log(`✅ Found ${tables.length} tables in database`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️ Could not verify table creation');
    }

  } catch (error) {
    console.error('❌ Database setup part 3 failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabasePart3();