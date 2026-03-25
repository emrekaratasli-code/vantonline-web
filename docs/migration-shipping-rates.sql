-- ============================================================
-- Shipping Rates: Multi-carrier, city-based pricing
-- ============================================================

-- Carriers table (e.g. Yurtici Kargo, DHL, Aras)
CREATE TABLE IF NOT EXISTS shipping_carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX IF NOT EXISTS shipping_carriers_name_key
    ON shipping_carriers (name);

-- Shipping rates per carrier + city
CREATE TABLE IF NOT EXISTS shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID REFERENCES shipping_carriers(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0, -- in kurus (100 = 1 TRY)
    estimated_days TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(carrier_id, city)
);

-- RLS
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Carriers" ON shipping_carriers;
DROP POLICY IF EXISTS "Public Read Rates" ON shipping_rates;

CREATE POLICY "Public Read Carriers" ON shipping_carriers FOR SELECT USING (true);
CREATE POLICY "Public Read Rates" ON shipping_rates FOR SELECT USING (true);

-- ============================================================
-- Seed data (safe to rerun)
-- ============================================================

INSERT INTO shipping_carriers (name, sort_order) VALUES
    ('Yurtici Kargo', 1),
    ('Aras Kargo', 2),
    ('DHL', 3)
ON CONFLICT (name) DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

INSERT INTO shipping_rates (carrier_id, city, price, estimated_days)
SELECT id, 'Istanbul', 4999, '1-2 is gunu' FROM shipping_carriers WHERE name = 'Yurtici Kargo'
UNION ALL
SELECT id, 'Ankara', 5999, '2-3 is gunu' FROM shipping_carriers WHERE name = 'Yurtici Kargo'
UNION ALL
SELECT id, 'Izmir', 5999, '2-3 is gunu' FROM shipping_carriers WHERE name = 'Yurtici Kargo'
UNION ALL
SELECT id, 'Diger', 6999, '3-5 is gunu' FROM shipping_carriers WHERE name = 'Yurtici Kargo'
ON CONFLICT (carrier_id, city) DO UPDATE SET
    price = EXCLUDED.price,
    estimated_days = EXCLUDED.estimated_days,
    is_active = TRUE;

INSERT INTO shipping_rates (carrier_id, city, price, estimated_days)
SELECT id, 'Istanbul', 3999, '2-3 is gunu' FROM shipping_carriers WHERE name = 'Aras Kargo'
UNION ALL
SELECT id, 'Ankara', 4999, '3-4 is gunu' FROM shipping_carriers WHERE name = 'Aras Kargo'
UNION ALL
SELECT id, 'Izmir', 4999, '3-4 is gunu' FROM shipping_carriers WHERE name = 'Aras Kargo'
UNION ALL
SELECT id, 'Diger', 5999, '4-6 is gunu' FROM shipping_carriers WHERE name = 'Aras Kargo'
ON CONFLICT (carrier_id, city) DO UPDATE SET
    price = EXCLUDED.price,
    estimated_days = EXCLUDED.estimated_days,
    is_active = TRUE;

INSERT INTO shipping_rates (carrier_id, city, price, estimated_days)
SELECT id, 'Istanbul', 7999, '1-2 is gunu' FROM shipping_carriers WHERE name = 'DHL'
UNION ALL
SELECT id, 'Ankara', 8999, '1-2 is gunu' FROM shipping_carriers WHERE name = 'DHL'
UNION ALL
SELECT id, 'Izmir', 8999, '1-2 is gunu' FROM shipping_carriers WHERE name = 'DHL'
UNION ALL
SELECT id, 'Diger', 9999, '2-3 is gunu' FROM shipping_carriers WHERE name = 'DHL'
ON CONFLICT (carrier_id, city) DO UPDATE SET
    price = EXCLUDED.price,
    estimated_days = EXCLUDED.estimated_days,
    is_active = TRUE;
