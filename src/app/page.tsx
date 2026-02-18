'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getFeaturedProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import FadeIn from '@/components/FadeIn';

export default function HomePage() {
    const { lang, t } = useLanguage();
    const featured = getFeaturedProducts();

    return (
        <>
            {/* HERO */}
            <section className="hero-gradient relative min-h-[90vh] flex items-center justify-center">
                <div className="container-vant text-center py-20">
                    <FadeIn>
                        <h1 className="font-heading text-hero font-bold uppercase leading-[0.95] tracking-tight">
                            {t.hero.headline[lang]}
                        </h1>
                    </FadeIn>
                    <FadeIn delay={0.15}>
                        <p className="mt-6 text-base md:text-lg text-vant-muted max-w-lg mx-auto font-body leading-relaxed">
                            {t.hero.subtext[lang]}
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.3}>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/drop" className="btn-primary">
                                {t.hero.cta[lang]}
                            </Link>
                            <Link href="/lookbook" className="btn-secondary">
                                {t.hero.ctaSecondary[lang]}
                            </Link>
                        </div>
                    </FadeIn>
                </div>

                {/* Subtle purple line accent */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-vant-purple" />
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="container-vant py-20 md:py-28">
                <FadeIn>
                    <h2 className="font-heading text-display font-bold uppercase tracking-tight text-center">
                        {t.featured.title[lang]}
                    </h2>
                </FadeIn>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {featured.map((product, i) => (
                        <FadeIn key={product.id} delay={i * 0.1}>
                            <ProductCard product={product} />
                        </FadeIn>
                    ))}
                </div>
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
