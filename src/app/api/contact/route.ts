import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { getContactMailer } from '@/lib/smtp';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

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

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendContactNotification(args: {
    name: string;
    email: string;
    message: string;
}) {
    const mailer = getContactMailer();

    if (!mailer.ok) {
        console.warn(`[contact] SMTP config missing or invalid: ${mailer.missing.join(', ')}`);
        return { sent: false, reason: 'missing_email_config' as const };
    }

    const escapedName = escapeHtml(args.name);
    const escapedEmail = escapeHtml(args.email);
    const escapedMessage = escapeHtml(args.message).replace(/\n/g, '<br />');

    try {
        await mailer.transporter.sendMail({
            from: mailer.from,
            to: mailer.to,
            replyTo: args.email,
            subject: `New contact form message from ${args.name}`,
            text: [
                'New contact form message',
                '',
                `Name: ${args.name}`,
                `Email: ${args.email}`,
                '',
                'Message:',
                args.message,
            ].join('\n'),
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                    <h2 style="margin-bottom: 16px;">New contact form message</h2>
                    <p><strong>Name:</strong> ${escapedName}</p>
                    <p><strong>Email:</strong> ${escapedEmail}</p>
                    <p><strong>Message:</strong></p>
                    <div style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb;">
                        ${escapedMessage}
                    </div>
                </div>
            `,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown SMTP error.';
        console.error(`[contact] SMTP send failed: ${message}`);
        return { sent: false, reason: 'send_failed' as const };
    }

    return { sent: true };
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, message, company } = await req.json();

        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedMessage = typeof message === 'string' ? message.trim() : '';

        if (company) {
            return NextResponse.json({ ok: true }, { status: 200 });
        }

        if (!normalizedName || normalizedName.length < 2) {
            return NextResponse.json({ ok: false, error: 'Invalid name.' }, { status: 400 });
        }

        if (!isValidEmail(normalizedEmail)) {
            return NextResponse.json({ ok: false, error: 'Invalid email.' }, { status: 400 });
        }

        if (!normalizedMessage || normalizedMessage.length < 10) {
            return NextResponse.json({ ok: false, error: 'Invalid message.' }, { status: 400 });
        }

        if (normalizedName.length > 120 || normalizedEmail.length > 180 || normalizedMessage.length > 5000) {
            return NextResponse.json({ ok: false, error: 'Payload too large.' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        if (isRateLimited(`contact:ip:${ip}`) || isRateLimited(`contact:email:${normalizedEmail}`)) {
            return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            return NextResponse.json({ ok: false, error: 'System error.' }, { status: 500 });
        }

        const { error } = await serviceClient.from('contact_messages').insert({
            name: normalizedName,
            email: normalizedEmail,
            message: normalizedMessage,
            source: 'web_contact_form',
            ip_address: ip,
            user_agent: req.headers.get('user-agent') || null,
        });

        if (error) {
            console.error('[contact] Supabase insert error:', error.message);
            return NextResponse.json({ ok: false, error: 'Could not save message.' }, { status: 500 });
        }

        const notification = await sendContactNotification({
            name: normalizedName,
            email: normalizedEmail,
            message: normalizedMessage,
        });

        return NextResponse.json({
            ok: true,
            notificationSent: notification.sent,
        });
    } catch (error) {
        console.error('[contact] Unexpected error:', error);
        return NextResponse.json({ ok: false, error: 'Server error.' }, { status: 500 });
    }
}
