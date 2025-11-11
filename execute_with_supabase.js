import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ctdakdqpmntycertugvz.supabase.co';
const supabaseKey = 'XTi99HWo5HvGvyFZ'; // This is the service key (full access)

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    console.log('Connecting to Supabase...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('create_remaining_tables.sql', 'utf8');

    console.log('Executing SQL commands...');

    // Execute the SQL using RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('SQL executed successfully!');

    // Check if tables exist by querying them
    const tables = ['orders', 'order_items', 'payment_transactions', 'product_reviews', 'coupons', 'shopping_cart'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact' });
        if (error) {
          console.log(`Table ${table}: Error - ${error.message}`);
        } else {
          console.log(`Table ${table}: Created successfully (${data.length} records)`);
        }
      } catch (err) {
        console.log(`Table ${table}: Could not verify - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQL();