-- docs/schema-checkout.sql
-- Run this in Supabase SQL Editor AFTER schema.sql

-- ============================================================
-- 1. CUSTOMERS (upserted on OTP verification)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL, -- E.164 format (+905XXXXXXXXX)
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    auth_user_id UUID, -- FK to auth.users (set on OTP verify)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON customers(auth_user_id);

-- ============================================================
-- 2. CUSTOMER CONSENTS (KVKK / ETK compliant)
--    One row per (customer, channel, purpose). Upserted on change.
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
    purpose TEXT NOT NULL CHECK (purpose IN ('marketing')),
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'checkout', -- checkout | profile | api
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (customer_id, channel, purpose)
);

-- ============================================================
-- 3. ORDERS (structure only — no real orders until payment)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    total INTEGER NOT NULL DEFAULT 0, -- in kuruş (100 kuruş = 1 TRY)
    currency TEXT NOT NULL DEFAULT 'TRY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================
-- 4. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    size TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0, -- price snapshot in kuruş
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SMS LOGS (audit trail for OTP / transactional / marketing)
-- ============================================================
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    phone TEXT NOT NULL,
    sms_type TEXT NOT NULL CHECK (sms_type IN ('otp', 'transactional', 'marketing')),
    provider TEXT, -- e.g. 'twilio', 'netgsm'
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
    error TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX IF NOT EXISTS idx_sms_logs_type ON sms_logs(sms_type);

-- ============================================================
-- 6. ABANDONED CARTS (optional — for marketing recovery)
-- ============================================================
CREATE TABLE IF NOT EXISTS abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT,
    customer_id UUID REFERENCES customers(id),
    cart_data JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    recovered_at TIMESTAMPTZ
);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
-- Reuse update_updated_at_column() from schema.sql if already created
CREATE TRIGGER IF NOT EXISTS update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Strict RLS: only service role can write (via API route handlers).
-- No direct client inserts allowed.
-- Authenticated users can read their own data:

CREATE POLICY "Users can read own customer record"
    ON customers FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Users can read own consents"
    ON customer_consents FOR SELECT
    TO authenticated
    USING (customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can read own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (customer_id IN (
        SELECT id FROM customers WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can read own order items"
    ON order_items FOR SELECT
    TO authenticated
    USING (order_id IN (
        SELECT id FROM orders WHERE customer_id IN (
            SELECT id FROM customers WHERE auth_user_id = auth.uid()
        )
    ));
