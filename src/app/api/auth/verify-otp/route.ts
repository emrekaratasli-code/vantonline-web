import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { consumeRateLimit } from '@/lib/rateLimit';

const RATE_WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
    try {
        const { email, phone, code, customer, consents } = await req.json();
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const otpDevBypassEnabled = process.env.OTP_DEV_BYPASS === 'true';
        const otpDevCode = process.env.OTP_DEV_CODE || '123456';

        if (!normalizedEmail || !code || typeof code !== 'string' || code.length !== 6) {
            return NextResponse.json(
                { error: 'Gecersiz istek.' },
                { status: 400 },
            );
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const [emailLimit, ipLimit] = await Promise.all([
            consumeRateLimit({
                namespace: 'otp-verify:email',
                key: normalizedEmail,
                limit: MAX_ATTEMPTS,
                windowMs: RATE_WINDOW_MS,
            }),
            consumeRateLimit({
                namespace: 'otp-verify:ip',
                key: ip,
                limit: MAX_ATTEMPTS,
                windowMs: RATE_WINDOW_MS,
            }),
        ]);

        if (emailLimit.limited || ipLimit.limited) {
            return NextResponse.json(
                { error: 'Cok fazla deneme. Lutfen bir dakika bekleyin.' },
                { status: 429 },
            );
        }

        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Sistem hatasi.' }, { status: 500 });
        }

        if (otpDevBypassEnabled && code === otpDevCode) {
            console.log('[verify-otp] DEV BYPASS active - accepting test code for ' + normalizedEmail);

            const serviceClient = createServiceRoleClient();
            if (serviceClient) {
                await serviceClient
                    .from('customers')
                    .upsert({ email: normalizedEmail, phone: phone || null, verified: true }, { onConflict: 'email' });
            }

            return NextResponse.json({ ok: true, dev: true, bypass: true });
        }

        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            email: normalizedEmail,
            token: code,
            type: 'email',
        });

        if (verifyError) {
            console.error('[verify-otp] Supabase verify error:', verifyError.message);
            return NextResponse.json(
                { error: 'Gecersiz kod. Tekrar deneyin.' },
                { status: 400 },
            );
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            console.error('[verify-otp] Service role client unavailable - skipping customer upsert.');
            return NextResponse.json({ ok: true, verified: true });
        }

        const authUserId = verifyData.user?.id ?? null;
        const now = new Date().toISOString();

        const { data: customerRow, error: customerError } = await serviceClient
            .from('customers')
            .upsert(
                {
                    email: normalizedEmail,
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
            return NextResponse.json({ ok: true, verified: true });
        }

        const customerId = customerRow?.id;

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
        return NextResponse.json({ error: 'Sunucu hatasi.' }, { status: 500 });
    }
}
