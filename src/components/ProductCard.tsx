'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { initiateCheckout } from '@/lib/pixel';
import type { Product } from '@/data/products';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { lang, t } = useLanguage();
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        // Quick-add with first available size/color
        const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standart';
        const rawColors = product.color ? product.color.split(',').map(c => c.trim()).filter(Boolean) : [];
        const defaultColor = rawColors.length > 0 ? rawColors[0] : 'Standart';

        addToCart(product, defaultSize, defaultColor, 1);
        initiateCheckout({
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            value: product.price / 100,
            currency: 'TRY',
            num_items: 1,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    /** Format kuruş → TRY display */
    const displayPrice = `${t.product.currency[lang]}${(product.price / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="product-card">
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-vant-gray overflow-hidden">
                <Image
                    src={product.images[0] || '/images/placeholder-product.svg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="product-image object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.svg'; }}
                />
                {product.isOutOfStock && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-vant-black/80 text-xs font-heading uppercase tracking-wider text-vant-muted">
                        {t.product.outOfStock[lang]}
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="mt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm uppercase tracking-wider text-vant-light">
                        {product.name}
                    </h3>
                    <span className="font-body text-sm text-vant-muted whitespace-nowrap">
                        {displayPrice}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <Link
                        href={`/product/${product.slug}`}
                        className="text-xs font-heading uppercase tracking-wider text-vant-muted hover:text-vant-purple transition-colors duration-300"
                    >
                        {t.product.inspect[lang]}
                    </Link>
                    <span className="text-vant-light/10">|</span>
                    {product.isOutOfStock ? (
                        <span className="text-xs font-heading uppercase tracking-wider text-vant-muted/40">
                            {t.product.outOfStock[lang]}
                        </span>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="text-xs font-heading uppercase tracking-wider text-vant-purple hover:text-vant-purple-light transition-colors duration-300"
                        >
                            {added ? t.product.addedToCart[lang] : t.product.addToCart[lang]}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
