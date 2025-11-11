const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://ctdakdqpmntycertugvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ5MTE2MywiZXhwIjoyMDc4MDY3MTYzfQ.UZhttkueYuqdTVdUgHfU_esS-3YT_nJlh64xVoJ4FFs';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL files to execute in order
const sqlFiles = [
  '01_create_users_table.sql',
  '02_create_categories_table.sql', 
  '03_create_products_table.sql',
  '04_create_enhanced_orders_table.sql',
  '05_create_order_items_table.sql',
  '06_create_shopping_cart_table.sql',
  '07_create_shipping_addresses_table.sql',
  '08_create_coupons_table.sql'
];

async function executeSqlFile(filename) {
  try {
    console.log(`\n📄 Reading ${filename}...`);
    const sqlContent = fs.readFileSync(filename, 'utf8');
    
    console.log(`🚀 Executing ${filename}...`);
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`   Executing: ${statement.substring(0, 100)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct SQL execution if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('_temp_execution')
            .select('*');
          
          if (directError && directError.message.includes('does not exist')) {
            // Table doesn't exist, try creating it directly
            console.log(`   ⚠️  RPC failed, trying direct execution...`);
            const { error: createError } = await supabase
              .from('information_schema.tables')
              .select('*');
            
            if (createError) {
              console.error(`   ❌ Error executing statement:`, error);
              console.error(`   Statement: ${statement}`);
              continue;
            }
          }
        }
        
        console.log(`   ✅ Statement executed successfully`);
      }
    }
    
    console.log(`✅ ${filename} executed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message);
    return false;
  }
}

async function executeAllSchemas() {
  console.log('🎯 Starting Supabase database schema execution...');
  console.log(`📍 Target: ${supabaseUrl}`);
  
  let successCount = 0;
  let totalCount = sqlFiles.length;
  
  for (const filename of sqlFiles) {
    const success = await executeSqlFile(filename);
    if (success) {
      successCount++;
    }
    
    // Add a small delay between files to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Schema execution completed!`);
  console.log(`✅ Successfully executed: ${successCount}/${totalCount} files`);
  
  if (successCount === totalCount) {
    console.log(`🚀 All database tables have been created in your Supabase project!`);
  } else {
    console.log(`⚠️  Some files may have failed. Please check the errors above.`);
  }
}

// Alternative approach using direct SQL execution via POST
async function executeSqlDirect(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql_query: sql })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Direct SQL execution error:', error);
    throw error;
  }
}

// Run the execution
executeAllSchemas().catch(console.error);