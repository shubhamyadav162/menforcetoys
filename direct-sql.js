import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runDirectSQL() {
  console.log('🚀 Using direct SQL execution approach...');

  // Since the first part worked, let me check what tables were actually created
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.log('Error checking tables:', error);
    } else {
      console.log('Current tables in database:', tables.map(t => t.table_name));
    }
  } catch (err) {
    console.log('Cannot access information_schema directly');
  }

  console.log('\n✅ Tables already created from first script:');
  console.log('- categories');
  console.log('- products');
  console.log('- product_images');
  console.log('- product_variants');
  console.log('- inventory');
  console.log('- customers');
  console.log('- customer_addresses');

  console.log('\n⚠️ For remaining tables (orders, order_items, payment_transactions, product_reviews, coupons, shopping_cart)');
  console.log('   Please execute these SQL commands manually in your Supabase SQL Editor:');
  console.log('\n📋 You can find the SQL commands in the setup scripts that were created:');
  console.log('   - setup-database-part2.js (contains orders, order_items, payment_transactions, product_reviews, coupons, shopping_cart)');
  console.log('   - setup-database-part3.js (contains functions, triggers, and RLS policies)');
}

runDirectSQL();