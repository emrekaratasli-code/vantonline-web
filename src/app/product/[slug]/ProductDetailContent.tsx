'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { viewContent, initiateCheckout } from '@/lib/pixel';
import ImageGallery from '@/components/ImageGallery';
import SizeSelector from '@/components/SizeSelector';
import FadeIn from '@/components/FadeIn';
import type { Product } from '@/data/products';

export default function ProductDetailContent() {
    const params = useParams();
    const slug = params.slug as string;
    const { lang, t } = useLanguage();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [sizeWarning, setSizeWarning] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [colorWarning, setColorWarning] = useState(false);
    const [addedFeedback, setAddedFeedback] = useState(false);

    // Fetch product from Supabase via an inline fetch
    useEffect(() => {
        let cancelled = false;
        async function fetchProduct() {
            try {
                // Use the supabaseProducts module dynamically
                const { getProductBySlug } = await import('@/lib/supabaseProducts');
                const p = await getProductBySlug(slug);
                if (!cancelled) {
                    setProduct(p);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        }
        fetchProduct();
        return () => { cancelled = true; };
    }, [slug]);

    // Track view
    useEffect(() => {
        if (product) {
            viewContent({
                content_name: product.name,
                content_ids: [product.id],
                content_type: 'product',
                value: product.price / 100,
                currency: 'TRY',
            });
        }
    }, [product]);

    if (loading) {
        return (
            <div className="container-vant py-20 text-center">
                <p className="text-vant-muted font-body animate-pulse">{t.product.loading[lang]}</p>
            </div>
        );
    }

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

    /** Format kuruş → TRY */
    const displayPrice = `${t.product.currency[lang]}${(product.price / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

    const colorOptions = product.color
        ? product.color.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

    const handleAddToCart = () => {
        const hasSizes = product.sizes && product.sizes.length > 0;
        const hasColors = colorOptions.length > 1;

        let valid = true;

        if (hasSizes && !selectedSize) {
            setSizeWarning(true);
            valid = false;
        } else {
            setSizeWarning(false);
        }

        if (hasColors && !selectedColor) {
            setColorWarning(true);
            valid = false;
        } else {
            setColorWarning(false);
        }

        if (!valid) return;

        const cartSize = hasSizes ? selectedSize : 'Standart';
        const cartColor = hasColors ? selectedColor : (colorOptions[0] || 'Standart');

        // Sepete ekle
        addToCart(product, cartSize, cartColor, 1);

        initiateCheckout({
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: product.price / 100,
            currency: 'TRY',
            num_items: 1,
        });

        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2500);
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
                        brand: { '@type': 'Brand', name: 'VANT Art' },
                        offers: {
                            '@type': 'Offer',
                            url: `https://vant.com.tr/product/${product.slug}`,
                            priceCurrency: 'TRY',
                            price: (product.price / 100).toFixed(2),
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
                                    {displayPrice}
                                </p>
                            </div>

                            {/* Limited edition badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-vant-purple/30 text-xs font-heading uppercase tracking-wider text-vant-purple">
                                <span className="w-1.5 h-1.5 bg-vant-purple rounded-full" />
                                {t.product.limitedEdition[lang]}
                            </div>

                            {/* Color Selector */}
                            {colorOptions.length > 1 ? (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-heading uppercase tracking-wider text-vant-muted">
                                            {t.product.color[lang]}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => { setSelectedColor(c); setColorWarning(false); }}
                                                className={`px-4 py-2 border text-sm font-heading uppercase tracking-wider transition-all duration-300 ${selectedColor === c
                                                    ? 'border-vant-purple text-vant-purple bg-vant-purple/10'
                                                    : 'border-vant-light/10 text-vant-light hover:border-vant-light/30'
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                    {colorWarning && (
                                        <p className="mt-2 text-xs text-red-500 font-heading uppercase tracking-wider">
                                            {lang === 'tr' ? 'Lütfen bir renk seçin' : 'Please select a color'}
                                        </p>
                                    )}
                                </div>
                            ) : colorOptions.length === 1 ? (
                                <div>
                                    <span className="text-xs font-heading uppercase tracking-wider text-vant-muted">
                                        {t.product.color[lang]}:
                                    </span>
                                    <span className="ml-2 text-sm text-vant-light">{colorOptions[0]}</span>
                                </div>
                            ) : null}

                            {/* Size selector */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <label className="block text-xs font-heading uppercase tracking-wider text-vant-muted mb-3">
                                        {t.product.size[lang]}
                                    </label>
                                    <SizeSelector
                                        sizes={product.sizes}
                                        selectedSize={selectedSize}
                                        onSelect={(s) => { setSelectedSize(s); setSizeWarning(false); }}
                                    />
                                    {!selectedSize && !sizeWarning && (
                                        <p className="mt-2 text-xs text-vant-muted/60">{t.product.selectSize[lang]}</p>
                                    )}
                                    {sizeWarning && (
                                        <p className="mt-2 text-xs text-red-400">{t.product.selectSizeWarning[lang]}</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                {product.isOutOfStock ? (
                                    <span className="btn-primary opacity-50 cursor-not-allowed">
                                        {t.product.outOfStock[lang]}
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        className="btn-primary"
                                    >
                                        {addedFeedback ? t.product.addedToCart[lang] : t.product.addToCart[lang]}
                                    </button>
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
