import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat
 * 
 * Proxy route to J.A.R.V.I.S. Telegram Bot API (Render).
 * This prevents CORS issues and keeps the backend URL concentrated in env vars.
 */

const BOT_API_URL = process.env.CHATBOT_API_URL || 'https://jarvis-bot-8080.onrender.com';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, session_id } = body;

        if (!message) {
            return NextResponse.json({ ok: false, error: 'Message is required' }, { status: 400 });
        }

        // Forward to the real J.A.R.V.I.S. API
        const response = await fetch(`${BOT_API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                session_id: session_id || 'web-user',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[chatbot_proxy] Backend error:', errorText);
            return NextResponse.json({ ok: false, error: 'J.A.R.V.I.S. is temporarily unavailable' }, { status: 502 });
        }

        const data = await response.json();
        return NextResponse.json({ ok: true, reply: data.reply, session_id: data.session_id });

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
