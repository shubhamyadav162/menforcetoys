// Deploy orders schema to Supabase
// Run: node deploy_schema.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qnvdzuiimikcrgpjfier.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudmR6dWlpbWlrY3JncGpmaWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0NzkyNywiZXhwIjoyMDgyMTIzOTI3fQ.KGX2J5oWUe-jjKT7_-mda02APmBKdiB-C08wH9ujr7k';

console.log('🚀 Deploying orders schema to Supabase...');
console.log('📍 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySchema() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'deploy_orders_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL by semicolons and execute each statement
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];

            // Skip empty statements
            if (!stmt || stmt.length < 10) continue;

            try {
                // Use rpc to execute raw SQL
                const { data, error } = await supabase.rpc('exec_raw_sql', {
                    sql_query: stmt + ';'
                });

                if (error) {
                    // If exec_raw_sql doesn't exist, try a different approach
                    console.log(`⚠️ Statement ${i + 1}: RPC not available, will use SQL Editor`);
                    errorCount++;
                } else {
                    console.log(`✅ Statement ${i + 1} executed`);
                    successCount++;
                }
            } catch (err) {
                console.log(`⚠️ Statement ${i + 1}: ${err.message?.substring(0, 50)}...`);
                errorCount++;
            }
        }

        console.log('');
        console.log('📊 Deployment Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⚠️ Skipped/Error: ${errorCount}`);
        console.log('');

        if (errorCount > 0) {
            console.log('⚠️ Some statements may need manual execution.');
            console.log('📋 Please run the SQL in Supabase SQL Editor:');
            console.log('   1. Go to: https://supabase.com/dashboard/project/qnvdzuiimikcrgpjfier/sql/new');
            console.log('   2. Copy contents of: deploy_orders_schema.sql');
            console.log('   3. Paste and click "Run"');
        }

        // Verify tables exist
        console.log('\n🔍 Verifying tables...');

        const { data: ordersCheck, error: ordersError } = await supabase
            .from('orders')
            .select('id')
            .limit(1);

        if (ordersError && ordersError.code === '42P01') {
            console.log('❌ Orders table does not exist - manual SQL execution required');
        } else if (ordersError) {
            console.log('⚠️ Orders table check:', ordersError.message);
        } else {
            console.log('✅ Orders table exists!');
        }

        const { data: paymentsCheck, error: paymentsError } = await supabase
            .from('payment_transactions')
            .select('id')
            .limit(1);

        if (paymentsError && paymentsError.code === '42P01') {
            console.log('❌ Payment_transactions table does not exist - manual SQL execution required');
        } else if (paymentsError) {
            console.log('⚠️ Payment_transactions table check:', paymentsError.message);
        } else {
            console.log('✅ Payment_transactions table exists!');
        }

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
    }
}

deploySchema();
