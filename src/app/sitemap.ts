import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCanonicalSiteUrl } from '@/lib/siteConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getCanonicalSiteUrl();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/drop`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/lookbook`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/size`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/preliminary-info`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/shipping-returns`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Dynamic product routes from Supabase
    try {
        const supabase = createServerSupabaseClient();
        if (!supabase) {
            return staticRoutes;
        }

        const { data: products } = await supabase
            .from('products')
            .select('slug, updated_at')
            .eq('is_published', true);

        if (products && products.length > 0) {
            const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
                url: `${baseUrl}/product/${product.slug}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));

            return [...staticRoutes, ...productRoutes];
        }
    } catch (error) {
        console.error('[sitemap] Error fetching products:', error);
    }

    return staticRoutes;
}
