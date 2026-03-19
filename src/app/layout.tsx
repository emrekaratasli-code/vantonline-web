import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.vantonline.com';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    alternates: {
        canonical: baseUrl,
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
        url: baseUrl,
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
                {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
                    <>
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
fbq('track', 'PageView');
                                `
                            }}
                        />
                        <noscript>
                            <img height="1" width="1" style={{ display: 'none' }}
                                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                                alt=""
                            />
                        </noscript>
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
