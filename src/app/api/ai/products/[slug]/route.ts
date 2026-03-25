import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey, getAdminClient, requireOwnerApproval } from '@/lib/apiAuth';
import { getProductBySlug } from '@/lib/supabaseProducts';

/**
 * GET /api/ai/products/[slug]
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') === 'en' ? 'en' : 'tr') as 'tr' | 'en';

    try {
        const product = await getProductBySlug(params.slug);

        if (!product) {
            return NextResponse.json(
                { ok: false, error: 'Product not found' },
                { status: 404 },
            );
        }

        const data = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            currency: product.currency,
            description: product.description[lang],
            categorySlug: product.categorySlug,
            sizes: product.sizes,
            color: product.color,
            images: product.images,
            isOutOfStock: product.isOutOfStock,
            isFeatured: product.isFeatured,
            careInstructions: product.careInstructions[lang],
        };

        return NextResponse.json({ ok: true, data });
    } catch (e) {
        console.error('[api/ai/products/slug] GET error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * PUT /api/ai/products/[slug]
 *
 * Body: partial product fields to update
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, `update_product:${params.slug}`);
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const body = await req.json();

        // Build update object — only include provided fields
        const updateFields: Record<string, unknown> = {};
        const allowedFields = [
            'slug', 'name', 'price', 'description_tr', 'description_en',
            'category_id', 'color', 'sizes', 'images', 'image_url',
            'is_out_of_stock', 'is_featured',
            'care_instructions_tr', 'care_instructions_en',
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateFields[field] = body[field];
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { ok: false, error: 'No valid fields to update' },
                { status: 400 },
            );
        }

        const { data, error } = await client
            .from('products')
            .update(updateFields)
            .eq('slug', params.slug)
            .select()
            .single();

        if (error) {
            console.error('[api/ai/products/slug] PUT supabase error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        if (!data) {
            return NextResponse.json(
                { ok: false, error: 'Product not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({ ok: true, data });
    } catch (e) {
        console.error('[api/ai/products/slug] PUT error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/ai/products/[slug]
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string } },
) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, `delete_product:${params.slug}`);
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const { error, count } = await client
            .from('products')
            .delete()
            .eq('slug', params.slug);

        if (error) {
            console.error('[api/ai/products/slug] DELETE error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({
            ok: true,
            message: `Product '${params.slug}' deleted`,
            deletedCount: count ?? 1,
        });
    } catch (e) {
        console.error('[api/ai/products/slug] DELETE error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
