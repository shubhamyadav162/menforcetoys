// Script to execute the complete e-commerce schema in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';

config({ path: '.env' });

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            if (statement.trim().length === 0) continue;

            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            try {
                // Use RPC to execute raw SQL
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement
                });

                if (error) {
                    console.error(`Error in statement ${i + 1}:`, error);

                    // If exec_sql doesn't exist, we need to create it first
                    if (error.message.includes('function exec_sql')) {
                        console.log('Creating exec_sql function first...');

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

                        const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', {
                            query: createFunctionSQL
                        });

                        if (funcError && !funcError.message.includes('already exists')) {
                            throw funcError;
                        }

                        // Retry the original statement
                        const { data: retryData, error: retryError } = await supabase.rpc('exec_sql', {
                            query: statement
                        });

                        if (retryError) {
                            throw retryError;
                        }

                        console.log(`Statement ${i + 1} executed successfully (after function creation)`);
                    } else {
                        throw error;
                    }
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }

                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                console.error(`Failed to execute statement ${i + 1}:`, err.message);
                console.error('Statement:', statement.substring(0, 100) + '...');

                // Continue with next statement for now
                continue;
            }
        }

        console.log('Schema execution completed!');

        // Verify the tables were created
        const tables = ['users', 'categories', 'products', 'orders_new', 'shopping_cart'];

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`Table ${table}:`, error.code === 'PGRST116' ? 'Not created' : 'Created but access error');
            } else {
                console.log(`✅ Table ${table}: Created successfully`);
            }
        }

    } catch (error) {
        console.error('Schema execution failed:', error);
    }
}

// Run the schema execution
executeSchema();