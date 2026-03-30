import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat
 * 
 * Proxy route to J.A.R.V.I.S. Telegram Bot API (Render).
 * Force rebuild to pick up new env vars.
 */

const DEFAULT_BOT_API_URL = 'https://jarvis-bot-2d6x.onrender.com';

const BOT_API_URL =
    process.env.CHATBOT_API_URL ||
    process.env.JARVIS_BOT_URL ||
    process.env.NEXT_PUBLIC_CHATBOT_API_URL ||
    DEFAULT_BOT_API_URL;

export async function POST(req: NextRequest) {
    try {
        if (!BOT_API_URL) {
            console.error('[chatbot_proxy] Missing bot URL. Define CHATBOT_API_URL (or JARVIS_BOT_URL).');
            return NextResponse.json({ 
                ok: false, 
                error: 'Chat service is not configured yet.' 
            }, { status: 500 });
        }

        const body = await req.json();
        const { message, session_id } = body;

        if (!message) {
            return NextResponse.json({ ok: false, error: 'Message is required' }, { status: 400 });
        }

        // Forward to the real J.A.R.V.I.S. API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        let targetUrl = BOT_API_URL.replace(/\/$/, '');
        // If the user already included /api/chat in the URL, remove it to avoid /api/chat/api/chat
        if (targetUrl.endsWith('/api/chat')) {
            targetUrl = targetUrl.replace(/\/api\/chat$/, '');
        }

        try {
            const response = await fetch(`${targetUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    session_id: session_id || 'web-user',
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[chatbot_proxy] Backend error:', response.status, errorText);
                return NextResponse.json({ ok: false, error: 'J.A.R.V.I.S. is temporarily unavailable' }, { status: 502 });
            }

            const data = await response.json();
            return NextResponse.json({ ok: true, reply: data.reply, session_id: data.session_id });
        } catch (fetchError: any) {
            if (fetchError.name === 'AbortError') {
                return NextResponse.json({ ok: false, error: 'Request timed out' }, { status: 504 });
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('[chatbot_proxy] Internal error:', error);
        return NextResponse.json({ ok: false, error: 'Connection failure' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
