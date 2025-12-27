// Script to execute the complete e-commerce schema in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env file
const supabaseUrl = 'https://ctdakdqpmntycertugvz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGFrZHFwbW50eWNlcnR1Z3Z6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ5MTE2MywiZXhwIjoyMDc4MDY3MTYzfQ.UZhttkueYuqdTVdUgHfU_esS-3YT_nJlh64xVoJ4FFs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchema() {
    try {
        console.log('Starting e-commerce schema execution...');

        // Read the schema file
        const schemaSQL = fs.readFileSync('complete_ecommerce_schema.sql', 'utf8');

        // Split the schema into manageable chunks
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute`);

        // First, try to create the exec_sql function
        console.log('Creating exec_sql function...');
        const createFunctionSQL = `
            CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
            RETURNS TABLE(result JSON)
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
                RETURN QUERY EXECUTE format('SELECT to_jsonb(row_to_json(t)) as result FROM (%s) t', query);
            END;
            $$;
        `;

        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                query: createFunctionSQL
            });

            if (error && !error.message.includes('already exists')) {
                console.log('Could not create exec_sql function:', error);
            } else {
                console.log('exec_sql function ready');
            }
        } catch (err) {
            console.log('Function creation attempt completed');
        }

        // Execute each statement in batches
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            if (statement.trim().length === 0) continue;

            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            try {
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement
                });

                if (error) {
                    console.error(`Error in statement ${i + 1}:`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                    successCount++;
                }

                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (err) {
                console.error(`Failed to execute statement ${i + 1}:`, err);
                errorCount++;
            }
        }

        console.log(`\nSchema execution completed!`);
        console.log(`Success: ${successCount}, Errors: ${errorCount}`);

        // Verify key tables were created
        const tables = ['users', 'categories', 'products', 'product_images', 'orders_new', 'shopping_cart'];

        console.log('\nVerifying table creation:');
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ Table ${table}: ${error.code === 'PGRST116' ? 'Not found' : 'Access error'}`);
                } else {
                    console.log(`✅ Table ${table}: Created successfully`);
                }
            } catch (err) {
                console.log(`❌ Table ${table}: Error checking - ${err.message}`);
            }
        }

    } catch (error) {
        console.error('Schema execution failed:', error);
    }
}

// Run the schema execution
executeSchema().catch(console.error);