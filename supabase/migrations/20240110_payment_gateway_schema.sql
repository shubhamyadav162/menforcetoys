-- =================================================================
-- PAYMENT GATEWAY INTEGRATION SCHEMA FOR NP WELLNESS STORE
-- =================================================================
-- Execute these commands in your Supabase SQL Editor
-- =================================================================

-- 1. PAYMENT PROVIDERS TABLE (Store payment provider credentials)
-- =================================================================
CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  credentials JSONB NOT NULL DEFAULT '{}', -- Encrypted credentials
  supported_methods TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAYMENT TRANSACTIONS TABLE (Enhanced with gateway integration)
-- =================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Internal tracking
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE, -- Gateway transaction ID

  -- Amount and currency
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Gateway information
  gateway TEXT NOT NULL DEFAULT 'toys4peace',
  gateway_order_id TEXT, -- Client-provided order identifier
  gateway_transaction_id TEXT, -- Gateway transaction ID (e.g., G1250483V62XF)

  -- Payment details
  payment_method JSONB DEFAULT '{}',
  upi_string TEXT, -- UPI payment string from gateway
  vpa_id TEXT, -- Customer's VPA after payment
  bank_ref TEXT, -- Bank reference after payment

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled', 'refunded')
  ),
  gateway_status TEXT, -- Raw status from gateway

  -- Callback handling
  callback_url TEXT,
  callback_delivered BOOLEAN DEFAULT FALSE,
  callback_attempts INTEGER DEFAULT 0,
  callback_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Gateway-specific fields
  device_id TEXT,
  cancel_ts TIMESTAMP WITH TIME ZONE,
  callback_ts TIMESTAMP WITH TIME ZONE,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

-- 3. PAYMENT WEBHOOK LOGS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. MERCHANT CONFIGURATION TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS merchant_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gateway TEXT NOT NULL DEFAULT 'toys4peace',
  merchant_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  webhook_endpoint TEXT, -- Our webhook endpoint
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. UPDATE EXISTING ORDERS TABLE TO LINK WITH PAYMENT TRANSACTIONS
-- =================================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_transaction_id UUID REFERENCES payment_transactions(id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_transaction_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_order_id ON payment_transactions(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_expires_at ON payment_transactions(expires_at);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_gateway ON payment_webhook_logs(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_processed ON payment_webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_created_at ON payment_webhook_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_merchant_config_gateway ON merchant_config(gateway);
CREATE INDEX IF NOT EXISTS idx_merchant_config_is_active ON merchant_config(is_active);

-- Row Level Security
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Payment Providers (admin only)
CREATE POLICY "Admin access to payment providers" ON payment_providers
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Payment Transactions (users can view their own, admin can view all)
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin access to all payment transactions" ON payment_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Webhook Logs (admin only)
CREATE POLICY "Admin access to webhook logs" ON payment_webhook_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Merchant Config (admin only)
CREATE POLICY "Admin access to merchant config" ON merchant_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_providers_updated_at ON payment_providers;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
DROP TRIGGER IF EXISTS update_merchant_config_updated_at ON merchant_config;

CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON payment_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchant_config_updated_at BEFORE UPDATE ON merchant_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default merchant configuration
INSERT INTO merchant_config (
  gateway,
  merchant_id,
  webhook_endpoint,
  config
) VALUES (
  'toys4peace',
  'your_merchant_id_here', -- Update with actual merchant ID
  'https://your-project.supabase.co/functions/v1/payment-webhook',
  '{"expiry_seconds": 180, "retry_attempts": 3}'
) ON CONFLICT (gateway) DO UPDATE SET
  updated_at = NOW();

-- Insert payment provider configuration
INSERT INTO payment_providers (
  name,
  display_name,
  supported_methods,
  config
) VALUES (
  'toys4peace',
  'Toys4Peace Payment Gateway',
  '{upi}',
  '{"api_base": "https://api.toys4peace.workers.dev", "transaction_expiry": 180}'
) ON CONFLICT (name) DO NOTHING;

-- Function to generate unique gateway order IDs
CREATE OR REPLACE FUNCTION generate_gateway_order_id()
RETURNS TEXT AS $$
DECLARE
  timestamp_part TEXT;
  random_part TEXT;
BEGIN
  timestamp_part := TO_CHAR(NOW(), 'YYMMDDHH24MISS');
  random_part := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN 'NP' || timestamp_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update expired transactions
CREATE OR REPLACE FUNCTION update_expired_transactions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update expired transactions to cancelled status
  UPDATE payment_transactions
  SET status = 'cancelled',
      updated_at = NOW(),
      callback_data = jsonb_set(
        callback_data,
        '{reason}',
        '"expired"'
      )
  WHERE status = 'pending'
    AND expires_at <= NOW()
    AND callback_delivered = FALSE;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check for expired transactions (you can call this periodically)
-- This would typically be called by a scheduled job or external service

-- Completion message
DO $$
BEGIN
  RAISE NOTICE 'Payment Gateway Integration Schema Created Successfully!';
  RAISE NOTICE 'Tables created: payment_providers, payment_transactions, payment_webhook_logs, merchant_config';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Row Level Security enabled with appropriate policies';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Update merchant_id with your actual Toys4Peace merchant ID';
  RAISE NOTICE '2. Set up webhook endpoint URL';
  RAISE NOTICE '3. Store merchant credentials securely';
  RAISE NOTICE '4. Create Edge Functions for payment processing';
END $$;