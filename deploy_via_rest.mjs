// Deploy database schema to Supabase using REST API
// Run: node deploy_via_rest.mjs

const SUPABASE_URL = 'https://qnvdzuiimikcrgpjfier.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudmR6dWlpbWlrY3JncGpmaWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0NzkyNywiZXhwIjoyMDgyMTIzOTI3fQ.KGX2J5oWUe-jjKT7_-mda02APmBKdiB-C08wH9ujr7k';

const SQL_STATEMENTS = [
    // 1. Create orders table
    `CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    shipping_address JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method JSONB,
    shipping_method JSONB,
    tracking_number TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMPTZ,
    order_items JSONB NOT NULL DEFAULT '[]',
    notes JSONB,
    internal_notes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 2. Create payment_transactions table
    `CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'acceptpay',
    gateway_order_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method JSONB,
    gateway_response JSONB,
    vpa_id TEXT,
    bank_ref TEXT,
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 3. Create indexes
    `CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`,
    `CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id)`,

    // 4. Enable RLS
    `ALTER TABLE orders ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY`,

    // 5. Create RLS policies for orders
    `DROP POLICY IF EXISTS "Allow insert orders" ON orders`,
    `CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true)`,
    `DROP POLICY IF EXISTS "Allow select orders" ON orders`,
    `CREATE POLICY "Allow select orders" ON orders FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow update orders" ON orders`,
    `CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true)`,

    // 6. Create RLS policies for payment_transactions
    `DROP POLICY IF EXISTS "Allow insert payment_transactions" ON payment_transactions`,
    `CREATE POLICY "Allow insert payment_transactions" ON payment_transactions FOR INSERT WITH CHECK (true)`,
    `DROP POLICY IF EXISTS "Allow select payment_transactions" ON payment_transactions`,
    `CREATE POLICY "Allow select payment_transactions" ON payment_transactions FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow update payment_transactions" ON payment_transactions`,
    `CREATE POLICY "Allow update payment_transactions" ON payment_transactions FOR UPDATE USING (true)`
];

async function executeSQL(sql) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        // Try direct postgres query endpoint
        const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ query: sql })
        });

        if (!pgResponse.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        return { success: true };
    }
    return { success: true };
}

async function checkTableExists(tableName) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=0`, {
        method: 'GET',
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
    });
    return response.ok;
}

async function main() {
    console.log('🚀 Deploying database schema to Supabase...\n');

    // Check if tables already exist
    console.log('📊 Checking existing tables...');
    const ordersExists = await checkTableExists('orders');
    const paymentsExists = await checkTableExists('payment_transactions');

    console.log(`   orders table: ${ordersExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`   payment_transactions table: ${paymentsExists ? '✅ EXISTS' : '❌ NOT FOUND'}\n`);

    if (ordersExists && paymentsExists) {
        console.log('✅ Both tables already exist! Database is ready.');
        return;
    }

    // Execute SQL statements
    console.log('📝 Executing SQL statements...\n');

    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
        const sql = SQL_STATEMENTS[i];
        const shortSql = sql.substring(0, 60).replace(/\n/g, ' ') + '...';

        try {
            const result = await executeSQL(sql);
            if (result.success) {
                console.log(`✅ [${i + 1}/${SQL_STATEMENTS.length}] ${shortSql}`);
            } else {
                console.log(`⚠️ [${i + 1}/${SQL_STATEMENTS.length}] ${shortSql} - ${result.error}`);
            }
        } catch (error) {
            console.log(`❌ [${i + 1}/${SQL_STATEMENTS.length}] ${shortSql} - ${error.message}`);
        }
    }

    // Final check
    console.log('\n🔍 Final verification...');
    const finalOrdersCheck = await checkTableExists('orders');
    const finalPaymentsCheck = await checkTableExists('payment_transactions');

    console.log(`   orders table: ${finalOrdersCheck ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`   payment_transactions table: ${finalPaymentsCheck ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    if (!finalOrdersCheck || !finalPaymentsCheck) {
        console.log('\n⚠️ Tables not created via REST API.');
        console.log('📋 Please run the SQL manually in Supabase SQL Editor:');
        console.log('   https://supabase.com/dashboard/project/qnvdzuiimikcrgpjfier/sql/new');
    } else {
        console.log('\n🎉 Database schema deployed successfully!');
    }
}

main().catch(console.error);
