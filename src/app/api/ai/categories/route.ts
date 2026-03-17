import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey, getAdminClient } from '@/lib/apiAuth';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/ai/categories
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
            .from('categories')
            .select('id, slug')
            .order('slug', { ascending: true });

        if (error) {
            console.error('[api/ai/categories] Supabase error:', error.message);
            return NextResponse.json(
                { ok: false, error: 'Failed to fetch categories' },
                { status: 500 },
            );
        }

        return NextResponse.json({
            ok: true,
            count: (data ?? []).length,
            data: data ?? [],
        });
    } catch (e) {
        console.error('[api/ai/categories] GET error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * POST /api/ai/categories
 *
 * Body: { slug: string }
 */
export async function POST(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const body = await req.json();

        if (!body.slug) {
            return NextResponse.json(
                { ok: false, error: 'Missing required field: slug' },
                { status: 400 },
            );
        }

        const { data, error } = await client
            .from('categories')
            .insert({ slug: body.slug })
            .select()
            .single();

        if (error) {
            console.error('[api/ai/categories] POST supabase error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({ ok: true, data }, { status: 201 });
    } catch (e) {
        console.error('[api/ai/categories] POST error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/ai/categories?slug=xxx
 */
export async function DELETE(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json(
            { ok: false, error: 'Missing query param: slug' },
            { status: 400 },
        );
    }

    try {
        const { error } = await client
            .from('categories')
            .delete()
            .eq('slug', slug);

        if (error) {
            console.error('[api/ai/categories] DELETE error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({
            ok: true,
            message: `Category '${slug}' deleted`,
        });
    } catch (e) {
        console.error('[api/ai/categories] DELETE error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
