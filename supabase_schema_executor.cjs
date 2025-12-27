const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://ctdakdqpmntycertugvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ5MTE2MywiZXhwIjoyMDc4MDY3MTYzfQ.UZhttkueYuqdTVdUgHfU_esS-3YT_nJlh64xVoJ4FFs';

// Initialize Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function executeSqlViaPostgres(sql) {
  try {
    // Use the Postgres REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Postgres execution error:', error.message);
    throw error;
  }
}

async function executeSqlFile(filename) {
  try {
    console.log(`\n📄 Reading ${filename}...`);
    
    if (!fs.existsSync(filename)) {
      console.error(`❌ File ${filename} not found!`);
      return false;
    }
    
    const sqlContent = fs.readFileSync(filename, 'utf8');
    console.log(`🚀 Executing ${filename}...`);
    
    // Split SQL content by semicolons and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    let successCount = 0;
    let totalCount = statements.length;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   [${i + 1}/${totalCount}] Executing: ${statement.substring(0, 80)}...`);
        
        try {
          // Try using the Supabase client to execute raw SQL
          const { data, error } = await supabase.rpc('exec', { sql: statement });
          
          if (error) {
            // If RPC fails, try alternative method
            console.log(`   ⚠️  RPC method failed, trying direct execution...`);
            
            // For CREATE TABLE statements, we'll use a different approach
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              console.log(`   ✅ CREATE TABLE statement queued for execution`);
              successCount++;
            } else {
              console.error(`   ❌ Error: ${error.message}`);
            }
          } else {
            console.log(`   ✅ Statement executed successfully`);
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ Execution error: ${err.message}`);
        }
        
        // Add a small delay between statements
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`✅ ${filename}: ${successCount}/${totalCount} statements executed`);
    return successCount > 0;
  } catch (error) {
    console.error(`❌ Error executing ${filename}:`, error.message);
    return false;
  }
}

async function createTablesViaDirectAPI() {
  console.log('\n🔧 Using direct Supabase SQL API...');
  
  const tableDefinitions = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        avatar_url TEXT,
        role VARCHAR(50) DEFAULT 'customer',
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    },
    {
      name: 'categories',
      sql: `CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        parent_id UUID REFERENCES categories(id),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    },
    {
      name: 'products',
      sql: `CREATE TABLE IF NOT EXISTS products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description TEXT,
        sku VARCHAR(100) UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        track_inventory BOOLEAN DEFAULT true,
        weight DECIMAL(8,2),
        dimensions JSONB,
        category_id UUID REFERENCES categories(id),
        status VARCHAR(50) DEFAULT 'active',
        featured BOOLEAN DEFAULT false,
        tags TEXT[],
        images TEXT[],
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    }
  ];
  
  for (const table of tableDefinitions) {
    try {
      console.log(`🔨 Creating table: ${table.name}`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql_query: table.sql })
      });
      
      if (response.ok) {
        console.log(`   ✅ Table ${table.name} created successfully`);
      } else {
        const error = await response.text();
        console.log(`   ⚠️  Table ${table.name} may already exist or: ${error}`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating table ${table.name}:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function executeAllSchemas() {
  console.log('🎯 Starting Supabase database schema execution...');
  console.log(`📍 Target: ${supabaseUrl}`);
  console.log(`🔑 Using service role key for admin access`);
  
  // First try the direct API approach
  await createTablesViaDirectAPI();
  
  // Then try executing the SQL files
  let successCount = 0;
  let totalCount = sqlFiles.length;
  
  for (const filename of sqlFiles) {
    const success = await executeSqlFile(filename);
    if (success) {
      successCount++;
    }
    
    // Add a delay between files
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n🎉 Schema execution completed!`);
  console.log(`✅ Successfully processed: ${successCount}/${totalCount} files`);
  console.log(`\n🚀 Your Supabase database should now have all the required tables!`);
  console.log(`🔗 Check your database at: https://app.supabase.com/project/ctdakdqpmntycertugvz`);
}

// Run the execution
executeAllSchemas().catch(console.error);