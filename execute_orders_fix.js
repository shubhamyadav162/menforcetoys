import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';
config();

// Read the SQL file
const sqlScript = fs.readFileSync('./fix_orders_table.sql', 'utf8');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlScript() {
  try {
    console.log('Executing orders table fix script...');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });
        
        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Orders table fix completed successfully!');
    
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
}

// Alternative approach using direct SQL execution via REST API
async function executeViaRestApi() {
  try {
    console.log('Executing orders table fix via REST API...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query: sqlScript
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error executing SQL:', error);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Orders table fix completed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error executing via REST API:', error);
  }
}

// Try both methods
async function main() {
  console.log('Attempting to fix orders table...');
  console.log('Supabase URL:', supabaseUrl);
  
  // First try the RPC method
  await executeSqlScript();
  
  // If that fails, try REST API
  // await executeViaRestApi();
  
  console.log('\nIf the script execution failed, please manually run the SQL in fix_orders_table.sql in your Supabase SQL Editor.');
  console.log('You can access it at: https://app.supabase.com/project/_/sql');
}

main();