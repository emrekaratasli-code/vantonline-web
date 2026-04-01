import { MetadataRoute } from 'next';
import { getCanonicalSiteUrl } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getCanonicalSiteUrl();

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/_next/', '/.*\\.json$'],
            },
            {
                userAgent: 'AdsBot-Google',
                allow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
