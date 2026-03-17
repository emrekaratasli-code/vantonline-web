import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Simple in-memory rate limiter (per-phone + per-IP)                 */
/*  In production replace with Redis / Upstash Rate Limit.             */
/* ------------------------------------------------------------------ */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 3; // 3 OTP sends per minute per key

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return false;
    }
    entry.count += 1;
    return entry.count > MAX_REQUESTS;
}

/* ------------------------------------------------------------------ */
/*  POST /api/auth/send-otp                                            */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone || typeof phone !== 'string' || !/^\+905\d{9}$/.test(phone)) {
            return NextResponse.json(
                { error: 'Geçerli bir telefon numarası girin (+905XXXXXXXXX).' },
                { status: 400 },
            );
        }

        // Rate limit by phone
        if (isRateLimited(`phone:${phone}`)) {
            return NextResponse.json(
                { error: 'Çok fazla deneme. Lütfen bir dakika bekleyin.' },
                { status: 429 },
            );
        }

        // Rate limit by IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        if (isRateLimited(`ip:${ip}`)) {
            return NextResponse.json(
                { error: 'Çok fazla deneme. Lütfen bir dakika bekleyin.' },
                { status: 429 },
            );
        }

        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Sistem hatası. Lütfen daha sonra tekrar deneyin.' },
                { status: 500 },
            );
        }

        // Dev bypass — skip real SMS in development for testing
        if (process.env.NODE_ENV === 'development') {
            console.log(`[send-otp] DEV MODE — skipping real SMS for ${phone}. Use code: 123456`);
            return NextResponse.json({ ok: true, dev: true });
        }

        // Trigger Supabase Phone OTP via SMS (Twilio)
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                channel: 'sms',
            }
        });

        if (error) {
            console.error('[send-otp] Supabase error:', error.message);
            return NextResponse.json(
                { error: 'Kod gönderilemedi. Lütfen tekrar deneyin.' },
                { status: 500 },
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[send-otp] Unexpected error:', e);
        return NextResponse.json(
            { error: 'Sunucu hatası.' },
            { status: 500 },
        );
    }
}
