'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import FadeIn from '@/components/FadeIn';
import type { Product } from '@/data/products';

export default function LookbookClient() {
    const { lang, t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import('@/lib/supabaseProducts').then(m => {
            m.getAllProducts().then(data => {
                setProducts(data);
                setLoading(false);
            }).catch(() => setLoading(false));
        });
    }, []);

    return (
        <section className="container-vant py-12 md:py-20">
            {/* Header */}
            <FadeIn>
                <div className="text-center mb-12">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.lookbook.title[lang]}
                    </h1>
                    <p className="mt-4 text-sm text-vant-muted max-w-md mx-auto">
                        {t.lookbook.subtitle[lang]}
                    </p>
                </div>
            </FadeIn>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-vant-purple animate-pulse"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Editorial grid — products from DB */}
            {!loading && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {products.map((product, i) => (
                        <FadeIn key={product.id} delay={i * 0.05}>
                            <Link
                                href={`/product/${product.slug}`}
                                className={`group block relative overflow-hidden ${i % 3 === 0 ? 'md:col-span-2' : ''}`}
                            >
                                <div
                                    className={`relative bg-vant-gray overflow-hidden
                                        ${i % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}
                                >
                                    <Image
                                        src={product.images?.[0] ?? '/images/placeholder-product.svg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover product-image"
                                        sizes={i % 3 === 0 ? '100vw' : '50vw'}
                                        loading="lazy"
                                    />

                                    {/* Dark overlay + caption on hover */}
                                    <div className="absolute inset-0 bg-vant-black/0 group-hover:bg-vant-black/55 transition-all duration-500 flex flex-col justify-end">
                                        <div className="p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                            <p className="font-heading text-xs uppercase tracking-[0.15em] text-vant-purple mb-1">
                                                {product.categorySlug ?? ''}
                                            </p>
                                            <h2 className="font-heading text-base uppercase tracking-wide text-white">
                                                {product.name}
                                            </h2>
                                            <p className="mt-1 text-xs text-vant-light/70">
                                                {lang === 'tr' ? 'İncele →' : 'View →'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* "Sınırlı Üretim" badge */}
                                    {product.isFeatured && (
                                        <span className="absolute top-3 left-3 bg-vant-purple/90 text-white font-heading text-[10px] uppercase tracking-wider px-2 py-1">
                                            {t.product.limitedEdition[lang]}
                                        </span>
                                    )}
                                </div>

                                {/* Caption below card */}
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="font-heading text-xs uppercase tracking-wider text-vant-light/50">
                                        {String(i + 1).padStart(2, '0')} — {product.name}
                                    </span>
                                    <span className="text-xs text-vant-muted">
                                        {product.price !== undefined
                                            ? `₺${(product.price / 100).toFixed(0)}`
                                            : ''}
                                    </span>
                                </div>
                            </Link>
                        </FadeIn>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
                <FadeIn>
                    <div className="text-center py-20">
                        <p className="text-sm text-vant-muted mb-6">
                            {lang === 'tr'
                                ? 'Koleksiyon görüntüleri yakında eklenecek.'
                                : 'Collection imagery coming soon.'}
                        </p>
                    </div>
                </FadeIn>
            )}

            {/* CTA */}
            {!loading && (
                <FadeIn delay={0.2}>
                    <div className="mt-16 text-center">
                        <Link href="/drop" className="btn-primary">
                            {lang === 'tr' ? "Drop'a Git" : 'Go to Drop'}
                        </Link>
                    </div>
                </FadeIn>
            )}
        </section>
    );
}
