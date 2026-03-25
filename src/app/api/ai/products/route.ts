import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey, getAdminClient, requireOwnerApproval } from '@/lib/apiAuth';
import { getAllProducts, getFeaturedProducts, getProductsByCategory } from '@/lib/supabaseProducts';

/**
 * GET /api/ai/products
 *
 * Query params:
 *   ?lang=tr|en        — choose description language (default: tr)
 *   ?featured=true     — only featured products
 *   ?category=<slug>   — filter by category slug
 */
export async function GET(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') === 'en' ? 'en' : 'tr') as 'tr' | 'en';
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');

    try {
        let products;

        if (featured) {
            products = await getFeaturedProducts(50);
        } else if (category) {
            products = await getProductsByCategory(category);
        } else {
            products = await getAllProducts();
        }

        const data = products.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            currency: p.currency,
            description: p.description[lang],
            categorySlug: p.categorySlug,
            sizes: p.sizes,
            color: p.color,
            images: p.images,
            isOutOfStock: p.isOutOfStock,
            isFeatured: p.isFeatured,
            careInstructions: p.careInstructions[lang],
        }));

        return NextResponse.json({ ok: true, count: data.length, data });
    } catch (e) {
        console.error('[api/ai/products] GET error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * POST /api/ai/products
 *
 * Body: {
 *   slug, name, price, description_tr, description_en,
 *   category_id?, color?, sizes?, images?, image_url?,
 *   is_out_of_stock?, is_featured?,
 *   care_instructions_tr?, care_instructions_en?
 * }
 */
export async function POST(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;
    const approvalError = requireOwnerApproval(req, 'create_product');
    if (approvalError) return approvalError;

    const result = getAdminClient();
    if ('error' in result) return result.error;
    const { client } = result;

    try {
        const body = await req.json();

        // Validate required fields
        if (!body.slug || !body.name || body.price === undefined) {
            return NextResponse.json(
                { ok: false, error: 'Missing required fields: slug, name, price' },
                { status: 400 },
            );
        }

        const row = {
            slug: body.slug,
            name: body.name,
            price: body.price,
            description_tr: body.description_tr ?? null,
            description_en: body.description_en ?? null,
            category_id: body.category_id ?? null,
            color: body.color ?? null,
            sizes: body.sizes ?? [],
            images: body.images ?? [],
            image_url: body.image_url ?? null,
            is_out_of_stock: body.is_out_of_stock ?? false,
            is_featured: body.is_featured ?? false,
            care_instructions_tr: body.care_instructions_tr ?? [],
            care_instructions_en: body.care_instructions_en ?? [],
        };

        const { data, error } = await client
            .from('products')
            .insert(row)
            .select()
            .single();

        if (error) {
            console.error('[api/ai/products] POST supabase error:', error.message);
            return NextResponse.json(
                { ok: false, error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json({ ok: true, data }, { status: 201 });
    } catch (e) {
        console.error('[api/ai/products] POST error:', e);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
