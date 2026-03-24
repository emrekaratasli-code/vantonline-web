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
        <div className="product-card group relative">
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] bg-vant-gray overflow-hidden border border-vant-light/5 group-hover:border-vant-purple/30 transition-colors duration-500">
                <Image
                    src={product.images[0] || '/images/placeholder-product.svg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="product-image object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-product.svg'; }}
                />
                <div className="absolute inset-0 bg-vant-black/0 group-hover:bg-vant-black/10 transition-colors duration-500" />
                {product.isOutOfStock && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-vant-black/80 text-[10px] font-heading uppercase tracking-widest text-vant-muted border border-vant-light/10">
                        {t.product.outOfStock[lang]}
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="mt-5 space-y-3 px-1">
                <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light/90 group-hover:text-vant-purple transition-colors duration-300">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="font-body text-sm font-medium text-vant-light">
                            {displayPrice}
                        </span>
                        <div className="h-[1px] flex-1 mx-4 bg-vant-light/5 group-hover:bg-vant-purple/20 transition-colors duration-500" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                    <Link
                        href={`/product/${product.slug}`}
                        className="text-[10px] font-heading uppercase tracking-[0.2em] text-vant-muted hover:text-vant-light transition-colors duration-300"
                    >
                        {t.product.inspect[lang]}
                    </Link>
                    
                    {product.isOutOfStock ? (
                        <span className="text-[10px] font-heading uppercase tracking-[0.2em] text-vant-muted/30">
                            {t.product.outOfStock[lang]}
                        </span>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className={`text-[10px] font-heading uppercase tracking-[0.2em] transition-all duration-300 ${
                                added ? 'text-vant-purple font-bold' : 'text-vant-light hover:text-vant-purple'
                            }`}
                        >
                            {added ? t.product.addedToCart[lang] : `+ ${t.product.addToCart[lang]}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
