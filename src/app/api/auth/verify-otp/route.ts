import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Simple in-memory rate limiter for verification attempts            */
/* ------------------------------------------------------------------ */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5; // 5 verify attempts per minute

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return false;
    }
    entry.count += 1;
    return entry.count > MAX_ATTEMPTS;
}

/* ------------------------------------------------------------------ */
/*  POST /api/auth/verify-otp                                          */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const { email, phone, code, customer, consents } = await req.json();

        if (!email || !code || typeof code !== 'string' || code.length !== 6) {
            return NextResponse.json(
                { error: 'Geçersiz istek.' },
                { status: 400 },
            );
        }

        // Rate limit
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        if (isRateLimited(`verify:${email}`) || isRateLimited(`verify-ip:${ip}`)) {
            return NextResponse.json(
                { error: 'Çok fazla deneme. Lütfen bir dakika bekleyin.' },
                { status: 429 },
            );
        }

        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Sistem hatası.' }, { status: 500 });
        }

        // Dev bypass — accept 123456 in development without hitting Auth API
        if (process.env.NODE_ENV === 'development' && code === '123456') {
            console.log(`[verify-otp] DEV MODE — accepting test code for ${email}`);

            // Still upsert customer data in dev mode
            const serviceClient = createServiceRoleClient();
            if (serviceClient) {
                await serviceClient
                    .from('customers')
                    .upsert({ email, phone: phone || null, verified: true }, { onConflict: 'email' });
            }

            return NextResponse.json({ ok: true, dev: true });
        }

        // Verify OTP via Email
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email',
        });

        if (verifyError) {
            console.error('[verify-otp] Supabase verify error:', verifyError.message);
            return NextResponse.json(
                { error: 'Geçersiz kod. Tekrar deneyin.' },
                { status: 400 },
            );
        }

        // --- On successful verification, upsert customer & log consents --- //
        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            // Non-critical: OTP is already verified, just can't save customer data.
            console.error('[verify-otp] Service role client unavailable — skipping customer upsert.');
            return NextResponse.json({ ok: true, verified: true });
        }

        const authUserId = verifyData.user?.id ?? null;
        const now = new Date().toISOString();

        // Upsert customer
        const { data: customerRow, error: customerError } = await serviceClient
            .from('customers')
            .upsert(
                {
                    email,
                    phone: phone || null,
                    first_name: customer?.firstName || null,
                    last_name: customer?.lastName || null,
                    auth_user_id: authUserId,
                    updated_at: now,
                },
                { onConflict: 'email' },
            )
            .select('id')
            .single();

        if (customerError) {
            console.error('[verify-otp] Customer upsert error:', customerError.message);
            // Non-critical — OTP is still verified.
            return NextResponse.json({ ok: true, verified: true });
        }

        const customerId = customerRow?.id;

        // Log marketing consents (only if customer was created)
        if (customerId && consents) {
            const consentRows: Array<{
                customer_id: string;
                channel: string;
                purpose: string;
                granted: boolean;
                granted_at: string | null;
                source: string;
                ip_address: string;
            }> = [];

            if (typeof consents.marketingSms === 'boolean') {
                consentRows.push({
                    customer_id: customerId,
                    channel: 'sms',
                    purpose: 'marketing',
                    granted: consents.marketingSms,
                    granted_at: consents.marketingSms ? now : null,
                    source: 'checkout',
                    ip_address: ip,
                });
            }

            if (typeof consents.marketingEmail === 'boolean') {
                consentRows.push({
                    customer_id: customerId,
                    channel: 'email',
                    purpose: 'marketing',
                    granted: consents.marketingEmail,
                    granted_at: consents.marketingEmail ? now : null,
                    source: 'checkout',
                    ip_address: ip,
                });
            }

            if (consentRows.length > 0) {
                const { error: consentError } = await serviceClient
                    .from('customer_consents')
                    .upsert(consentRows, {
                        onConflict: 'customer_id,channel,purpose',
                    });

                if (consentError) {
                    console.error('[verify-otp] Consent upsert error:', consentError.message);
                }
            }
        }

        return NextResponse.json({ ok: true, verified: true });
    } catch (e) {
        console.error('[verify-otp] Unexpected error:', e);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
