import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
    metadataBase: new URL('https://vant.com.tr'),
    title: {
        default: 'VANT Art — Hatırlanmak için.',
        template: '%s | VANT Art',
    },
    description: 'VANT Art — Premium streetwear. Sınırlı üretim, cesur tasarım. Purple Slash koleksiyonu.',
    keywords: ['streetwear', 'türk tasarım', 'sınırlı üretim', 'oversize', 'VANT Art', 'purple slash', 'sokak modası'],
    authors: [{ name: 'VANT Art' }],
    creator: 'VANT Art',
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: 'https://vant.com.tr',
        siteName: 'VANT Art',
        title: 'VANT Art — Hatırlanmak için.',
        description: 'Premium streetwear. Sınırlı üretim, cesur tasarım.',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VANT Art Streetwear' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VANT Art — Hatırlanmak için.',
        description: 'Premium streetwear. Sınırlı üretim, cesur tasarım.',
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
                <link rel="canonical" href="https://vant.com.tr" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'VANT Art',
                            url: 'https://vant.com.tr',
                            logo: 'https://vant.com.tr/logo.png',
                            sameAs: [
                                'https://instagram.com/vant',
                                'https://twitter.com/vant',
                                'https://tiktok.com/@vant',
                            ],
                            description: 'Premium streetwear. Sınırlı üretim, cesur tasarım.',
                        }),
                    }}
                />
                {/* Google Analytics placeholder */}
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
