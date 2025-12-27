// Deploy database schema using Supabase Management API
// Run: node deploy_via_management_api.mjs

const PROJECT_REF = 'qnvdzuiimikcrgpjfier';
const ACCESS_TOKEN = 'sbp_11c9e6d5749ffb6ee03fdfbd071c25ebec2308d6';

const SQL_SCHEMA = `
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
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
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
DROP POLICY IF EXISTS "Allow insert orders" ON orders;
CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow select orders" ON orders;
CREATE POLICY "Allow select orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow update orders" ON orders;
CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true);

-- Create RLS policies for payment_transactions
DROP POLICY IF EXISTS "Allow insert payment_transactions" ON payment_transactions;
CREATE POLICY "Allow insert payment_transactions" ON payment_transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow select payment_transactions" ON payment_transactions;
CREATE POLICY "Allow select payment_transactions" ON payment_transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow update payment_transactions" ON payment_transactions;
CREATE POLICY "Allow update payment_transactions" ON payment_transactions FOR UPDATE USING (true);
`;

async function executeSQL() {
    console.log('🚀 Deploying database schema via Supabase Management API...\n');
    console.log('📍 Project:', PROJECT_REF);
    console.log('');

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                query: SQL_SCHEMA
            })
        });

        const responseText = await response.text();
        console.log('Response Status:', response.status);

        if (response.ok) {
            console.log('✅ SQL executed successfully!');
            try {
                const data = JSON.parse(responseText);
                console.log('Response:', JSON.stringify(data, null, 2));
            } catch {
                console.log('Response:', responseText);
            }
        } else {
            console.log('❌ Error:', responseText);

            // Try alternative endpoint
            console.log('\n🔄 Trying alternative SQL endpoint...');
            const altResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    query: SQL_SCHEMA
                })
            });

            const altText = await altResponse.text();
            console.log('Alt Response Status:', altResponse.status);

            if (altResponse.ok) {
                console.log('✅ SQL executed via alternative endpoint!');
            } else {
                console.log('❌ Alternative endpoint also failed:', altText);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // Verify by checking the tables
    console.log('\n🔍 Verifying tables...');
    const SUPABASE_URL = 'https://qnvdzuiimikcrgpjfier.supabase.co';
    const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudmR6dWlpbWlrY3JncGpmaWVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU0NzkyNywiZXhwIjoyMDgyMTIzOTI3fQ.KGX2J5oWUe-jjKT7_-mda02APmBKdiB-C08wH9ujr7k';

    const ordersCheck = await fetch(`${SUPABASE_URL}/rest/v1/orders?limit=0`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
    });

    const paymentsCheck = await fetch(`${SUPABASE_URL}/rest/v1/payment_transactions?limit=0`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
    });

    console.log(`   orders table: ${ordersCheck.ok ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`   payment_transactions table: ${paymentsCheck.ok ? '✅ EXISTS' : '❌ NOT FOUND'}`);
}

executeSQL();
