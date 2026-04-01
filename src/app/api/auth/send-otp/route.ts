import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { consumeRateLimit } from '@/lib/rateLimit';

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const otpDevBypassEnabled = process.env.OTP_DEV_BYPASS === 'true';
        const otpDevCode = process.env.OTP_DEV_CODE || '123456';

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json(
                { error: 'Lutfen gecerli bir e-posta adresi girin.' },
                { status: 400 },
            );
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const [emailLimit, ipLimit] = await Promise.all([
            consumeRateLimit({
                namespace: 'otp-send:email',
                key: normalizedEmail,
                limit: MAX_REQUESTS,
                windowMs: RATE_WINDOW_MS,
            }),
            consumeRateLimit({
                namespace: 'otp-send:ip',
                key: ip,
                limit: MAX_REQUESTS,
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
            return NextResponse.json(
                { error: 'Sistem hatasi. Lutfen daha sonra tekrar deneyin.' },
                { status: 500 },
            );
        }

        if (otpDevBypassEnabled) {
            console.log('[send-otp] DEV BYPASS active for ' + normalizedEmail + '. Use code: ' + otpDevCode);
            return NextResponse.json({ ok: true, dev: true, bypass: true });
        }

        const { error } = await supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: {
                shouldCreateUser: true,
            },
        });

        if (error) {
            console.error('[send-otp] Supabase error:', error.message);
            return NextResponse.json(
                { error: 'Kod gonderilemedi. Lutfen tekrar deneyin.' },
                { status: 500 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[send-otp] Unexpected error:', e);
        return NextResponse.json(
            { error: 'Sunucu hatasi.' },
            { status: 500 },
        );
    }
}
