'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import FadeIn from '@/components/FadeIn';

export default function CartPage() {
    const { lang, t } = useLanguage();
    const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

    /** Format kuruş → TRY display */
    const formatPrice = (kuruş: number) => {
        return `${t.product.currency[lang]}${(kuruş / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
    };

    if (cartItems.length === 0) {
        return (
            <section className="container-vant py-20 md:py-28 text-center">
                <FadeIn>
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.cart.title[lang]}
                    </h1>
                    <p className="mt-6 text-vant-muted font-body">
                        {t.cart.empty[lang]}
                    </p>
                    <Link href="/drop" className="btn-primary mt-8 inline-block">
                        {t.cart.continueShopping[lang]}
                    </Link>
                </FadeIn>
            </section>
        );
    }

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center mb-12">
                    {t.cart.title[lang]}
                </h1>
            </FadeIn>

            {/* Items */}
            <div className="space-y-6 max-w-3xl mx-auto">
                {cartItems.map((item, idx) => (
                    <FadeIn key={item.id} delay={idx * 0.05}>
                        <div className="flex gap-4 md:gap-6 p-4 border border-vant-light/5 bg-vant-gray/30">
                            {/* Image */}
                            <Link href={`/product/${item.slug}`} className="relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 bg-vant-gray overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </Link>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <Link href={`/product/${item.slug}`}>
                                        <h3 className="font-heading text-sm uppercase tracking-wider text-vant-light hover:text-vant-purple transition-colors">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-vant-muted mt-1">
                                        {t.product.size[lang]}: {item.size}
                                        {item.color && item.color !== 'Standart' && ` | ${t.product.color[lang]}: ${item.color}`}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-7 h-7 flex items-center justify-center border border-vant-light/10 text-vant-muted hover:text-vant-light hover:border-vant-purple/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm text-vant-light font-body min-w-[20px] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center border border-vant-light/10 text-vant-muted hover:text-vant-light hover:border-vant-purple/50 transition-colors text-xs"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-vant-light font-heading">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-xs text-vant-muted hover:text-red-400 transition-colors font-heading uppercase tracking-wider"
                                        >
                                            {t.cart.remove[lang]}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>

            {/* Footer */}
            <FadeIn delay={0.2}>
                <div className="max-w-3xl mx-auto mt-10 pt-6 border-t border-vant-light/5">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-heading text-sm uppercase tracking-wider text-vant-muted">
                            {t.cart.total[lang]}
                        </span>
                        <span className="font-heading text-xl text-vant-light">
                            {formatPrice(cartTotal)}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/checkout" className="btn-primary flex-1 text-center">
                            {t.cart.checkout[lang]}
                        </Link>
                        <button
                            onClick={clearCart}
                            className="btn-secondary text-center"
                        >
                            {t.cart.clear[lang]}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/drop" className="text-xs font-heading uppercase tracking-wider text-vant-muted hover:text-vant-purple transition-colors">
                            {t.cart.continueShopping[lang]}
                        </Link>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
