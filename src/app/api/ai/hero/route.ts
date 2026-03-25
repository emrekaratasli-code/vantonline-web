import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey, getAdminClient, requireOwnerApproval } from '@/lib/apiAuth';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/ai/hero
 *
 * Returns all hero assets (active and inactive).
 */
export async function GET(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { ok: false, error: 'Database not configured' },
                { status: 500 },
            );
        }

        const { data, error } = await supabase
            .from('hero_assets')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('[api/ai/hero] GET error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 500 },
            );
        }

        return NextResponse.json({
            ok: true,
            count: (data ?? []).length,
            data: data ?? [],
        });
    } catch (e) {
        console.error('[api/ai/hero] GET error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * POST /api/ai/hero
 *
 * Body: { video_url: string, active?: boolean }
 */
export async function POST(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, 'create_hero_asset');
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const body = await req.json();

        if (!body.video_url) {
            return NextResponse.json(
                { ok: false, error: 'Missing required field: video_url' },
                { status: 400 },
            );
        }

        const { data, error } = await client
            .from('hero_assets')
            .insert({
                video_url: body.video_url,
                active: body.active ?? true,
            })
            .select()
            .single();

        if (error) {
            console.error('[api/ai/hero] POST error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({ ok: true, data }, { status: 201 });
    } catch (e) {
        console.error('[api/ai/hero] POST error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * PUT /api/ai/hero
 *
 * Body: { id: string, video_url?: string, active?: boolean }
 */
export async function PUT(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, 'update_hero_asset');
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const body = await req.json();

        if (!body.id) {
            return NextResponse.json(
                { ok: false, error: 'Missing required field: id' },
                { status: 400 },
            );
        }

        const updateFields: Record<string, unknown> = {};
        if (body.video_url !== undefined) updateFields.video_url = body.video_url;
        if (body.active !== undefined) updateFields.active = body.active;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { ok: false, error: 'No valid fields to update (video_url, active)' },
                { status: 400 },
            );
        }

        const { data, error } = await client
            .from('hero_assets')
            .update(updateFields)
            .eq('id', body.id)
            .select()
            .single();

        if (error) {
            console.error('[api/ai/hero] PUT error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({ ok: true, data });
    } catch (e) {
        console.error('[api/ai/hero] PUT error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/ai/hero?id=xxx
 */
export async function DELETE(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, 'delete_hero_asset');
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { ok: false, error: 'Missing query param: id' },
            { status: 400 },
        );
    }

    try {
        const { error } = await client
            .from('hero_assets')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[api/ai/hero] DELETE error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({
            ok: true,
            message: `Hero asset '${id}' deleted`,
        });
    } catch (e) {
        console.error('[api/ai/hero] DELETE error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
