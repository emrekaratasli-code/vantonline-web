import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase admin client (service role) for write operations.
 * Returns null + 500 response if misconfigured.
 */
export function getAdminClient(): { client: SupabaseClient } | { error: NextResponse } {
    const client = createServiceRoleClient();
    if (!client) {
        return {
            error: NextResponse.json(
                { ok: false, error: 'Database admin client not configured' },
                { status: 500 },
            ),
        };
    }
    return { client };
}

/**
 * Validates the Bearer token from the Authorization header.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function requireApiKey(req: NextRequest): NextResponse | null {
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.API_SECRET_KEY;

    if (!expectedKey) {
        console.error('[apiAuth] API_SECRET_KEY is not set in environment variables.');
        return NextResponse.json(
            { ok: false, error: 'Server configuration error' },
            { status: 500 },
        );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { ok: false, error: 'Unauthorized — missing Bearer token' },
            { status: 401 },
        );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    if (token !== expectedKey) {
        return NextResponse.json(
            { ok: false, error: 'Unauthorized — invalid token' },
            { status: 401 },
        );
    }

    return null; // Auth OK
}
