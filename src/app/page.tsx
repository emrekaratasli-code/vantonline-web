'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import FadeIn from '@/components/FadeIn';
import type { Product } from '@/data/products';

export default function HomePage() {
    const { lang, t } = useLanguage();
    const [featured, setFeatured] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Hero media state — defaults to fallback until loaded
    const [heroMedia, setHeroMedia] = useState<{ src: string; type: 'video' | 'image' }[]>([
        { src: '/videos/hero.mp4', type: 'video' },
        { src: '/videos/Hero1.jpg', type: 'image' },
    ]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const handleMediaEnded = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length);
    };

    // For images, auto-advance after 5 seconds
    useEffect(() => {
        if (!heroMedia || heroMedia.length === 0) return;
        const current = heroMedia[currentMediaIndex];
        if (current && current.type === 'image') {
            const timer = setTimeout(() => {
                setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentMediaIndex, heroMedia]);

    useEffect(() => {
        // Fetch hero assets
        import('@/lib/supabaseHero').then(m => {
            m.getHeroAssets().then(data => {
                if (data && data.length > 0) {
                    setHeroMedia(data.map(item => ({ src: item.src, type: item.type })));
                }
            }).catch(console.error);
        });

        // Fetch products
        import('@/lib/supabaseProducts').then(m => {
            m.getFeaturedProducts().then(data => {
                setFeatured(data);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, []);
    const manifestoContent = lang === 'tr'
        ? {
            title: 'VANT Art Protokolü',
            text: "Eğer sadece 'çok güzel' bir kıyafet arıyorsan, hemen bu sayfadan ayrıl. Çünkü burası, sana dayatılan o sıradan ve pürüzsüz güzellik algılarının tatmin edileceği bir yer değil. Biz, senin kendi seçmediğin her şeye karşıyız. Bir şeyler anlatmak istiyoruz.",
            question: 'Peki, sen ne anlatmak istiyorsun?',
        }
        : {
            title: t.homeNeo.manifestoTitle[lang],
            text: t.homeNeo.manifestoText[lang],
            question: '',
        };

    return (
        <>
            <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
                {/* Hero media slideshow */}
                {heroMedia.map((media, index) => (
                    <div
                        key={media.src}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentMediaIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {media.type === 'video' ? (
                            <video
                                src={media.src}
                                autoPlay={index === currentMediaIndex}
                                muted
                                playsInline
                                onEnded={handleMediaEnded}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={media.src}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ objectPosition: '70% 30%' }}
                            />
                        )}
                    </div>
                ))}
                <div className="absolute inset-0 bg-black/55 z-0" />
                <div className="absolute inset-0 z-0 hero-gradient" />

                <div className="relative z-10 container-vant py-20 flex flex-col items-start justify-end h-full">
                    <FadeIn delay={0.12} direction="up">
                        <h1 className="max-w-4xl font-heading text-hero font-bold uppercase leading-[0.9] text-vant-light">
                            {t.homeNeo.heroHeadline[lang]}
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.22} direction="up">
                        <p className="mt-6 max-w-xl text-sm md:text-base text-vant-light/80 leading-relaxed">
                            {t.homeNeo.heroSubtext[lang]}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                            <Link href="/drop" className="btn-primary">
                                {t.homeNeo.heroCta[lang]}
                            </Link>
                            <Link href="/lookbook" className="btn-secondary">
                                {t.homeNeo.heroSecondary[lang]}
                            </Link>
                        </div>
                    </FadeIn>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-vant-purple z-10" />
            </section>

            <section className="border-y border-vant-light/15 bg-vant-dark/70">
                <div className="container-vant py-5">
                    <dl className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
                        {[
                            { icon: 'SH', tr: 'Ücretsiz Kargo', en: 'Free Shipping' },
                            { icon: '24', tr: '1-3 İş Gününde Kargoda', en: 'Ships in 1-3 Business Days' },
                            { icon: 'RT', tr: '14 Gün İade', en: '14-Day Returns' },
                        ].map((item) => (
                            <div key={item.tr} className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-8 h-8 border border-vant-light/40 text-[10px] font-heading tracking-[0.2em] text-vant-light">
                                    {item.icon}
                                </span>
                                <dt className="font-heading text-[11px] uppercase tracking-[0.18em] text-vant-light/85">
                                    {lang === 'tr' ? item.tr : item.en}
                                </dt>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <h2 className="font-heading text-display font-bold uppercase tracking-[-0.01em] text-center">
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
                            <FadeIn key={product.id} delay={i * 0.08} className={i % 2 === 0 ? 'lg:translate-y-3' : ''}>
                                <ProductCard product={product} />
                            </FadeIn>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-vant-muted font-body py-12">
                        {t.product.noProducts[lang]}
                    </p>
                )}

                <FadeIn delay={0.25}>
                    <div className="mt-14 text-center">
                        <Link href="/drop" className="btn-outline">
                            {lang === 'tr' ? 'Tümünü Gör' : 'View All'}
                        </Link>
                    </div>
                </FadeIn>
            </section>

            <div className="divider container-vant" />

            <section className="container-vant py-20 md:py-28 relative overflow-hidden">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                    <div
                        className="w-40 h-40 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-center bg-contain bg-no-repeat"
                        style={{
                            backgroundImage: "url('/images/logo-crown.png')",
                            opacity: 0.10,
                        }}
                    />
                </div>
                <FadeIn direction="none" duration={1} delay={0.2}>
                    <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                        <h2 className="font-heading text-display font-bold tracking-tight uppercase">
                            {manifestoContent.title}
                        </h2>
                        <div className="mt-8 flex justify-center">
                            <div className="w-12 h-[1px] bg-vant-purple/50" />
                        </div>
                        <p className="mt-10 text-lg md:text-xl text-vant-light/80 font-body leading-relaxed max-w-2xl mx-auto italic">
                            {`"${manifestoContent.text}"`}
                        </p>
                        {manifestoContent.question && (
                            <FadeIn delay={0.5} direction="up">
                                <p className="mt-12 text-xl md:text-2xl text-vant-purple font-heading uppercase tracking-[0.2em] animate-pulse">
                                    {manifestoContent.question}
                                </p>
                            </FadeIn>
                        )}
                    </div>
                </FadeIn>
            </section>

            <div className="divider container-vant" />

            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <div className="text-center">
                        <h2 className="font-heading text-title font-bold uppercase tracking-[0.04em]">
                            {t.homeNeo.newsletterTitle[lang]}
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
