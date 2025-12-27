import { supabase, ORDERS_TABLE_SCHEMA } from "@/lib/supabase";

// This function can be called to initialize the database schema
export const initializeDatabaseSchema = async () => {
  try {
    console.log('Initializing database schema...');

    // Create the orders table using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: ORDERS_TABLE_SCHEMA
    });

    if (error) {
      console.error('Error initializing database schema:', error);

      // If exec_sql function doesn't exist, create it first
      if (error.message.includes('function exec_sql')) {
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

        const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', {
          query: createFunctionSQL
        });

        if (funcError && !funcError.message.includes('already exists')) {
          throw funcError;
        }

        // Now try to create the table again
        console.log('Creating orders table...');
        const { data: tableData, error: tableError } = await supabase.rpc('exec_sql', {
          query: ORDERS_TABLE_SCHEMA
        });

        if (tableError) {
          throw tableError;
        }

        console.log('Database schema initialized successfully!');
        return { success: true, data: tableData };
      }

      throw error;
    }

    console.log('Database schema initialized successfully!');
    return { success: true, data };

  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
};

// Auto-initialize when this module is imported
export const autoInitializeDatabase = async () => {
  // Check if orders table exists
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') { // Table doesn't exist
        console.log('Orders table not found, creating it...');
        return await initializeDatabaseSchema();
      }
      console.error('Error checking orders table:', error);
      return { success: false, error };
    }

    console.log('Orders table already exists');
    return { success: true, data: 'Table already exists' };

  } catch (err) {
    console.error('Error checking database:', err);
    return { success: false, error: err };
  }
};