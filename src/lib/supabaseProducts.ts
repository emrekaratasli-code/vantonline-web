import { createServerSupabaseClient } from './supabase';
import type { Product } from '@/data/products';

/* ------------------------------------------------------------------ */
/*  Placeholder image for products without images                      */
/* ------------------------------------------------------------------ */
const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

/* ------------------------------------------------------------------ */
/*  Row shape coming from Supabase (no join — flat query)              */
/* ------------------------------------------------------------------ */
interface ProductRow {
    id: string;
    slug: string;
    name: string;
    price: number;
    image_url: string | null;
    description_tr: string | null;
    description_en: string | null;
    category_id: string | null;
    color: string | null;
    sizes: string[] | null;
    images: string[] | null;
    is_out_of_stock: boolean;
    is_featured: boolean;
    care_instructions_tr: string[] | null;
    care_instructions_en: string[] | null;
    stock_quantity?: number;
}

/* ------------------------------------------------------------------ */
/*  Category cache (slug lookup by ID)                                 */
/* ------------------------------------------------------------------ */
let categoryCache: Record<string, string> | null = null;

async function getCategoryMap(): Promise<Record<string, string>> {
    if (categoryCache) return categoryCache;
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return {};
        const { data } = await supabase.from('categories').select('id, slug');
        const map: Record<string, string> = {};
        (data ?? []).forEach((c: { id: string; slug: string }) => {
            map[c.id] = c.slug;
        });
        categoryCache = map;
        // Invalidate after 5 minutes
        setTimeout(() => { categoryCache = null; }, 5 * 60 * 1000);
        return map;
    } catch {
        return {};
    }
}

/* ------------------------------------------------------------------ */
/*  Row → Product mapper                                               */
/* ------------------------------------------------------------------ */
function rowToProduct(row: ProductRow, catMap: Record<string, string>): Product {
    // Build images array: prefer images[], fallback to image_url, else placeholder
    let productImages: string[] = [];
    if (row.images && row.images.length > 0) {
        productImages = row.images;
    } else if (row.image_url) {
        productImages = [row.image_url];
    }
    // Always ensure at least one image (placeholder)
    if (productImages.length === 0) {
        productImages = [PLACEHOLDER_IMAGE];
    }

    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        price: row.price,
        currency: 'TRY',
        description: {
            tr: row.description_tr ?? '',
            en: row.description_en ?? '',
        },
        categorySlug: (row.category_id && catMap[row.category_id]) ?? '',
        sizes: row.sizes ?? [],
        color: row.color ?? '',
        images: productImages,
        isOutOfStock: row.is_out_of_stock ?? false,
        isFeatured: row.is_featured ?? false,
        careInstructions: {
            tr: row.care_instructions_tr ?? [],
            en: row.care_instructions_en ?? [],
        },
        stockQuantity: row.stock_quantity ?? 0,
    };
}

/* ------------------------------------------------------------------ */
/*  Simple select — no join, avoids FK issues                          */
/* ------------------------------------------------------------------ */
const PRODUCT_SELECT = '*, updated_at';

/* ------------------------------------------------------------------ */
/*  Public data-fetching helpers                                       */
/* ------------------------------------------------------------------ */

export async function getAllProducts(): Promise<Product[]> {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return [];

        const [catMap, { data, error }] = await Promise.all([
            getCategoryMap(),
            supabase
                .from('products')
                .select(PRODUCT_SELECT)
                .order('created_at', { ascending: false }),
        ]);

        if (error) {
            console.error('[supabaseProducts] getAllProducts error:', error.message);
            return [];
        }

        return (data ?? []).map((row: ProductRow) => rowToProduct(row, catMap));
    } catch (e) {
        console.error('[supabaseProducts] getAllProducts unexpected:', e);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return null;

        const [catMap, { data, error }] = await Promise.all([
            getCategoryMap(),
            supabase
                .from('products')
                .select(PRODUCT_SELECT)
                .eq('slug', slug)
                .single(),
        ]);

        if (error || !data) {
            if (error) console.error('[supabaseProducts] getProductBySlug error:', error.message);
            return null;
        }

        return rowToProduct(data as ProductRow, catMap);
    } catch (e) {
        console.error('[supabaseProducts] getProductBySlug unexpected:', e);
        return null;
    }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return [];

        const [catMap, { data, error }] = await Promise.all([
            getCategoryMap(),
            supabase
                .from('products')
                .select(PRODUCT_SELECT)
                .eq('is_featured', true)
                .eq('is_out_of_stock', false)
                .order('created_at', { ascending: false })
                .limit(limit),
        ]);

        if (error) {
            console.error('[supabaseProducts] getFeaturedProducts error:', error.message);
            return [];
        }

        return (data ?? []).map((row: ProductRow) => rowToProduct(row, catMap));
    } catch (e) {
        console.error('[supabaseProducts] getFeaturedProducts unexpected:', e);
        return [];
    }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) return [];

        // Get category ID from slug
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

        if (!cat) return [];

        const catMap = await getCategoryMap();

        const { data, error } = await supabase
            .from('products')
            .select(PRODUCT_SELECT)
            .eq('category_id', cat.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[supabaseProducts] getProductsByCategory error:', error.message);
            return [];
        }

        return (data ?? []).map((row: ProductRow) => rowToProduct(row, catMap));
    } catch (e) {
        console.error('[supabaseProducts] getProductsByCategory unexpected:', e);
        return [];
    }
}
