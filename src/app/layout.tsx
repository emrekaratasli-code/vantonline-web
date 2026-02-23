import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.vantonline.com'),
    alternates: {
        canonical: 'https://www.vantonline.com',
    },
    title: {
        default: 'VANT Art',
        template: '%s | VANT Art',
    },
    icons: {
        icon: '/images/logo-crown.png',
        apple: '/images/logo-crown.png',
    },
    description: 'VANT — Purple Slash koleksiyonu. Sınırlı üretim, cesur tasarım. Türkiye geneli ücretsiz kargo. Hatırlanmak için giyinmek.',
    keywords: ['streetwear', 'türk tasarım', 'sınırlı üretim', 'oversize', 'VANT', 'purple slash', 'sokak modası', 'wearable art'],
    authors: [{ name: 'VANT' }],
    creator: 'VANT',
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        alternateLocale: 'en_US',
        url: 'https://www.vantonline.com',
        siteName: 'VANT',
        title: 'VANT — Wearable Art / Streetwear',
        description: 'Purple Slash koleksiyonu. Sınırlı üretim, cesur tasarım. Türkiye geneli ücretsiz kargo.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'VANT Streetwear — Wearable Art',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VANT — Wearable Art / Streetwear',
        description: 'Purple Slash koleksiyonu. Sınırlı üretim, cesur tasarım.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" className="scroll-smooth">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'VANT',
                            url: 'https://www.vantonline.com',
                            logo: 'https://www.vantonline.com/images/logo-full.png',
                            sameAs: [
                                'https://www.instagram.com/vantartonline',
                                'https://www.tiktok.com/@vant.taki.aksesuar',
                            ],
                            description: 'VANT — Wearable art / streetwear. Sınırlı üretim, cesur tasarım. Purple Slash koleksiyonu.',
                        }),
                    }}
                />
                {process.env.NEXT_PUBLIC_GA_ID && (
                    <>
                        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
                            }}
                        />
                    </>
                )}
            </head>
            <body>
                <ClientLayout>{children}</ClientLayout>
                <div className="grain-overlay" aria-hidden="true" />
            </body>
        </html>
    );
}
