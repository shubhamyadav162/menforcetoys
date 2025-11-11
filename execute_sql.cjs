const { Client } = require('pg');
const fs = require('fs');

async function executeSQL() {
  const client = new Client({
    host: 'ctdakdqpmntycertugvz.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'XTi99HWo5HvGvyFZ',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database successfully');

    // Read the SQL file
    const sqlContent = fs.readFileSync('create_remaining_tables.sql', 'utf8');

    // Split the content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await client.query(statement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
          // Continue with other statements even if one fails
        }
      }
    }

    console.log('All SQL statements executed');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\nTables in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

executeSQL();