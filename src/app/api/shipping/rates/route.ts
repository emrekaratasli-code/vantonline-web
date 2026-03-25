import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

type CarrierRow = {
    id: string;
    name: string;
    logo_url: string | null;
    sort_order: number;
    is_active?: boolean;
};

type RateRow = {
    id: string;
    city: string;
    price: number;
    estimated_days: string | null;
    carrier: CarrierRow | CarrierRow[] | null;
};

/* ------------------------------------------------------------------ */
/*  GET /api/shipping/rates?city=Istanbul                              */
/*  Returns available carriers + prices for a given city.              */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
    const city = req.nextUrl.searchParams.get('city')?.trim();
    const FALLBACK_CITIES = ['Diger', 'Diğer'];

    if (!city) {
        return NextResponse.json({ error: 'City parameter is required.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    if (!supabase) {
        return NextResponse.json({ error: 'System error.' }, { status: 500 });
    }

    const { data, error } = await supabase
        .from('shipping_rates')
        .select(`
            id,
            city,
            price,
            estimated_days,
            carrier:shipping_carriers!carrier_id (
                id,
                name,
                logo_url,
                sort_order,
                is_active
            )
        `)
        .eq('is_active', true)
        .in('city', [city, ...FALLBACK_CITIES])
        .order('price', { ascending: true });

    if (error) {
        console.error('[shipping/rates] Error:', error.message);
        return NextResponse.json({ error: 'Could not load shipping rates.' }, { status: 500 });
    }

    const rates = (data ?? []) as unknown as RateRow[];
    if (rates.length === 0) {
        return NextResponse.json({ carriers: [], fallback: true });
    }

    const carrierMap = new Map<string, { rate: RateRow; carrier: CarrierRow }>();
    for (const rate of rates) {
        const carrier = Array.isArray(rate.carrier) ? rate.carrier[0] : rate.carrier;
        if (!carrier) continue;
        if (carrier.is_active === false) continue;

        const existing = carrierMap.get(carrier.id);
        const isExact = rate.city === city;
        if (!existing || isExact) {
            carrierMap.set(carrier.id, { rate, carrier });
        }
    }

    const carriers = Array.from(carrierMap.values())
        .map(({ rate, carrier }) => ({
            carrierId: carrier.id,
            carrierName: carrier.name,
            carrierLogo: carrier.logo_url,
            sortOrder: carrier.sort_order,
            price: rate.price,
            estimatedDays: rate.estimated_days,
            city: rate.city,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ carriers, fallback: carriers.every((item) => item.city !== city) });
}

