'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import FadeIn from '@/components/FadeIn';
import type { Product } from '@/data/products';

export default function HomePage() {
    const { lang, t } = useLanguage();
    const [featured, setFeatured] = useState<Product[]>([]);
    const [heroVideoUrls, setHeroVideoUrls] = useState<string[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch hero video URLs
        import('@/lib/heroData').then(m => {
            m.getActiveHeroVideoUrls().then(urls => setHeroVideoUrls(urls.length > 0 ? urls : ['/videos/hero.mp4']));
        });

        // Fetch featured products from Supabase
        import('@/lib/supabaseProducts').then(m => {
            m.getFeaturedProducts().then(data => {
                setFeatured(data);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, []);

    const handleVideoEnded = () => {
        if (heroVideoUrls.length > 1) {
            setCurrentVideoIndex((prev) => (prev + 1) % heroVideoUrls.length);
        }
    };

    const currentVideoSrc = heroVideoUrls[currentVideoIndex] || '/videos/hero.mp4';

    return (
        <>
            {/* HERO */}
            <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
                {/* Background Video (Sequential Playback) */}
                <video
                    key={currentVideoSrc}
                    src={currentVideoSrc}
                    autoPlay
                    loop={heroVideoUrls.length <= 1}
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    className="absolute inset-0 w-full h-full object-cover bg-gradient-to-br from-vant-black via-black to-vant-purple/10"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 z-0" />

                {/* Foreground Content */}
                <div className="relative z-10 container-vant text-center py-20 flex flex-col items-center justify-center h-full">
                    {/* Removed Logo and Subtext per request, keeping only CTAs below */}
                    <FadeIn delay={0.3}>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/drop" className="btn-primary">
                                {t.hero.cta[lang]}
                            </Link>
                            <Link href="/lookbook" className="btn-secondary bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black">
                                {t.hero.ctaSecondary[lang]}
                            </Link>
                        </div>
                    </FadeIn>
                </div>

                {/* Subtle purple line accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-vant-purple z-10" />
            </section>

            {/* TRUST STRIP */}
            <section className="border-y border-vant-light/5 bg-vant-dark/60">
                <div className="container-vant py-5">
                    <dl className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
                        {[
                            { icon: '🚚', tr: 'Ücretsiz Kargo', en: 'Free Shipping' },
                            { icon: '⏱', tr: '1–3 İş Günü Kargoda', en: 'Ships 1–3 Business Days' },
                            { icon: '🔄', tr: '14 Gün İade', en: '14-Day Returns' },
                        ].map((item) => (
                            <div key={item.tr} className="flex items-center gap-2">
                                <span className="text-base" role="img" aria-hidden="true">{item.icon}</span>
                                <dt className="font-heading text-xs uppercase tracking-[0.1em] text-vant-light/80">
                                    {lang === 'tr' ? item.tr : item.en}
                                </dt>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}

            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <h2 className="font-heading text-display font-bold uppercase tracking-tight text-center">
                        {t.featured.title[lang]}
                    </h2>
                </FadeIn>

                {loading ? (
                    <p className="text-center text-vant-muted font-body py-12 animate-pulse">
                        {t.product.loading[lang]}
                    </p>
                ) : featured.length > 0 ? (
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {featured.map((product, i) => (
                            <FadeIn key={product.id} delay={i * 0.1}>
                                <ProductCard product={product} />
                            </FadeIn>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-vant-muted font-body py-12">
                        {t.product.noProducts[lang]}
                    </p>
                )}

                <FadeIn delay={0.3}>
                    <div className="mt-12 text-center">
                        <Link href="/drop" className="btn-outline">
                            {lang === 'tr' ? 'Tümünü Gör' : 'View All'}
                        </Link>
                    </div>
                </FadeIn>
            </section>

            <div className="divider container-vant" />

            {/* MANIFESTO */}
            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-heading text-display font-bold uppercase tracking-tight">
                            {t.manifesto.title[lang]}
                        </h2>
                        <p className="mt-8 text-base md:text-lg text-vant-muted font-body leading-[1.8]">
                            {t.manifesto.text[lang]}
                        </p>
                        <div className="mt-8 w-8 h-[2px] bg-vant-purple mx-auto" />
                    </div>
                </FadeIn>
            </section>

            <div className="divider container-vant" />

            {/* NEWSLETTER */}
            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <div className="text-center">
                        <h2 className="font-heading text-title font-bold uppercase tracking-tight">
                            {t.newsletter.title[lang]}
                        </h2>
                        <div className="mt-8">
                            <NewsletterForm />
                        </div>
                    </div>
                </FadeIn>
            </section>
        </>
    );
}
