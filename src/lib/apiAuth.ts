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

/**
 * Enforces explicit owner approval on mutating J.A.R.V.I.S. actions.
 *
 * Usage:
 * - Set `JARVIS_REQUIRE_APPROVAL=true` (default behavior if unset).
 * - Set `JARVIS_OWNER_APPROVAL_KEY=<secret-known-only-by-owner>`.
 * - Send header `x-jarvis-owner-approval: <secret>` on write requests.
 */
export function requireOwnerApproval(req: NextRequest, action: string): NextResponse | null {
    const requireApproval = (process.env.JARVIS_REQUIRE_APPROVAL ?? 'true').toLowerCase() !== 'false';
    if (!requireApproval) return null;

    const ownerApprovalKey = process.env.JARVIS_OWNER_APPROVAL_KEY;
    if (!ownerApprovalKey) {
        console.error('[apiAuth] JARVIS_OWNER_APPROVAL_KEY is not set.');
        return NextResponse.json(
            { ok: false, error: 'Server configuration error', action },
            { status: 500 },
        );
    }

    const providedApproval = req.headers.get('x-jarvis-owner-approval');
    if (!providedApproval) {
        return NextResponse.json(
            {
                ok: false,
                error: 'Owner approval required',
                action,
                requiredHeader: 'x-jarvis-owner-approval',
            },
            { status: 428 },
        );
    }

    if (providedApproval !== ownerApprovalKey) {
        return NextResponse.json(
            { ok: false, error: 'Invalid owner approval token', action },
            { status: 403 },
        );
    }

    return null;
}
