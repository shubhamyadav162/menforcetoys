import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';
config();

// Read SQL file
const sqlScript = fs.readFileSync('./ORDERS_TABLE_FIX.sql', 'utf8');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function executeSql() {
  try {
    console.log('Executing SQL script via Supabase client...');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        
        // Use raw SQL execution through REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        } else {
          const result = await response.json();
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ SQL script execution completed!');
    
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
}

executeSql();