'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getProductBySlug } from '@/data/products';
import { viewContent, initiateCheckout } from '@/lib/pixel';
import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import FadeIn from '@/components/FadeIn';

export default function ProductDetailContent() {
    const params = useParams();
    const slug = params.slug as string;
    const product = getProductBySlug(slug);
    const { lang, t } = useLanguage();
    const [selectedSize, setSelectedSize] = useState('');

    useEffect(() => {
        if (product) {
            viewContent({
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: product.price,
                currency: 'TRY',
            });
        }
    }, [product]);

    if (!product) {
        return (
            <div className="container-vant py-20 text-center">
                <h1 className="font-heading text-display uppercase">
                    {lang === 'tr' ? 'Ürün bulunamadı' : 'Product not found'}
                </h1>
                <Link href="/drop" className="btn-secondary mt-8 inline-block">
                    {t.product.backToDrop[lang]}
                </Link>
            </div>
        );
    }

    const handleBuyClick = () => {
        initiateCheckout({
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: product.price,
            currency: 'TRY',
            num_items: 1,
        });
    };

    return (
        <>
            {/* JSON-LD Product schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: product.name,
                        description: product.description.tr,
                        image: product.images.map((img) => `https://vant.com.tr${img}`),
                        brand: { '@type': 'Brand', name: 'VANT' },
                        offers: {
                            '@type': 'Offer',
                            url: product.shopierUrl,
                            priceCurrency: 'TRY',
                            price: product.price,
                            availability: product.isOutOfStock
                                ? 'https://schema.org/OutOfStock'
                                : 'https://schema.org/InStock',
                        },
                    }),
                }}
            />

            <section className="container-vant py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    {/* Gallery */}
                    <FadeIn>
                        <ImageGallery images={product.images} alt={product.name} />
                    </FadeIn>

                    {/* Details */}
                    <FadeIn delay={0.15}>
                        <div className="space-y-6">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-xs text-vant-muted">
                                <Link href="/drop" className="hover:text-vant-purple transition-colors">
                                    {t.product.backToDrop[lang]}
                                </Link>
                                <span>/</span>
                                <span className="text-vant-light">{product.name}</span>
                            </div>

                            {/* Name & Price */}
                            <div>
                                <h1 className="font-heading text-title font-bold uppercase tracking-tight">
                                    {product.name}
                                </h1>
                                <p className="mt-2 font-heading text-2xl text-vant-light/90">
                                    {t.product.currency[lang]}{product.price}
                                </p>
                            </div>

                            {/* Limited edition badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-vant-purple/30 text-xs font-heading uppercase tracking-wider text-vant-purple">
                                <span className="w-1.5 h-1.5 bg-vant-purple rounded-full" />
                                {t.product.limitedEdition[lang]}
                            </div>

                            {/* Color */}
                            <div>
                                <span className="text-xs font-heading uppercase tracking-wider text-vant-muted">
                                    {t.product.color[lang]}:
                                </span>
                                <span className="ml-2 text-sm text-vant-light">{product.color}</span>
                            </div>

                            {/* Size selector */}
                            <div>
                                <label className="block text-xs font-heading uppercase tracking-wider text-vant-muted mb-3">
                                    {t.product.size[lang]}
                                </label>
                                <SizeSelector
                                    sizes={product.sizes}
                                    selectedSize={selectedSize}
                                    onSelect={setSelectedSize}
                                />
                                {!selectedSize && (
                                    <p className="mt-2 text-xs text-vant-muted/60">{t.product.selectSize[lang]}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {product.isOutOfStock ? (
                                    <span className="btn-primary opacity-50 cursor-not-allowed">
                                        {t.product.outOfStock[lang]}
                                    </span>
                                ) : (
                                    <a
                                        href={product.shopierUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleBuyClick}
                                        className="btn-primary"
                                    >
                                        {t.product.buyOnShopier[lang]}
                                    </a>
                                )}
                                <Link href="/drop" className="btn-secondary">
                                    {t.product.backToDrop[lang]}
                                </Link>
                            </div>

                            {/* Divider */}
                            <div className="divider" />

                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-heading uppercase tracking-wider text-vant-muted mb-3">
                                    {t.product.description[lang]}
                                </h3>
                                <p className="text-sm text-vant-light/80 font-body leading-relaxed">
                                    {product.description[lang]}
                                </p>
                            </div>

                            {/* Care */}
                            <div>
                                <h3 className="text-xs font-heading uppercase tracking-wider text-vant-muted mb-3">
                                    {t.product.care[lang]}
                                </h3>
                                <ul className="space-y-1.5">
                                    {product.careInstructions[lang].map((item, i) => (
                                        <li key={i} className="text-sm text-vant-light/60 font-body flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-vant-purple rounded-full flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Shipping */}
                            <div>
                                <h3 className="text-xs font-heading uppercase tracking-wider text-vant-muted mb-3">
                                    {t.product.shipping[lang]}
                                </h3>
                                <p className="text-sm text-vant-light/60 font-body leading-relaxed">
                                    {t.product.shippingInfo[lang]}
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </>
    );
}
