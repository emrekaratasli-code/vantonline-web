'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import FadeIn from '@/components/FadeIn';

function OrderSuccessContent() {
    const { lang } = useLanguage();
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order') ?? '';

    const [cleared, setCleared] = useState(false);

    // Clear cart once on mount
    useEffect(() => {
        if (!cleared) {
            clearCart();
            setCleared(true);
        }
    }, [cleared, clearCart]);

    const t = {
        title: { tr: 'Siparişiniz Alındı!', en: 'Order Confirmed!' },
        subtitle: {
            tr: 'Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.',
            en: 'Thank you. Your order has been successfully placed.',
        },
        orderNumberLabel: { tr: 'Sipariş Numarası', en: 'Order Number' },
        whatsNext: { tr: 'Sonraki Adımlar', en: 'What\'s Next' },
        step1: {
            tr: 'Siparişiniz onaylandı ve hazırlanmaya başlanacak.',
            en: 'Your order has been confirmed and will be prepared.',
        },
        step2: {
            tr: 'Kargoya verildiğinde takip numarası tarafınıza iletilecektir.',
            en: 'You will receive tracking information once shipped.',
        },
        step3: {
            tr: 'Tahmini teslimat süresi: 2-5 iş günü.',
            en: 'Estimated delivery: 2-5 business days.',
        },
        continueShopping: { tr: 'Alışverişe Devam Et', en: 'Continue Shopping' },
        backHome: { tr: 'Ana Sayfa', en: 'Home' },
    };

    return (
        <section className="container-vant py-16 md:py-24">
            <FadeIn>
                <div className="max-w-xl mx-auto text-center">
                    {/* Success icon */}
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-400">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.title[lang]}
                    </h1>
                    <p className="mt-4 text-vant-muted font-body text-base leading-relaxed">
                        {t.subtitle[lang]}
                    </p>

                    {/* Order number */}
                    {orderNumber && (
                        <div className="mt-8 p-5 border border-vant-purple/30 bg-vant-purple/5">
                            <p className="text-xs font-heading uppercase tracking-wider text-vant-muted mb-2">
                                {t.orderNumberLabel[lang]}
                            </p>
                            <p className="font-heading text-2xl text-vant-purple tracking-wider">
                                {orderNumber}
                            </p>
                        </div>
                    )}

                    {/* What's next */}
                    <div className="mt-10 text-left">
                        <h2 className="font-heading text-sm uppercase tracking-wider text-vant-muted mb-4">
                            {t.whatsNext[lang]}
                        </h2>
                        <div className="space-y-3">
                            {[t.step1, t.step2, t.step3].map((step, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 border border-vant-light/5 bg-vant-gray/20">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center border border-vant-purple/40 text-xs font-heading text-vant-purple">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-vant-light/80 font-body">
                                        {step[lang]}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/drop" className="btn-primary">
                            {t.continueShopping[lang]}
                        </Link>
                        <Link href="/" className="btn-secondary">
                            {t.backHome[lang]}
                        </Link>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="container-vant py-20 text-center text-vant-muted animate-pulse">
                Loading...
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
