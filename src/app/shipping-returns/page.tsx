'use client';

import { useLanguage } from '@/lib/i18n';
import FadeIn from '@/components/FadeIn';

export default function ShippingReturnsPage() {
    const { lang, t } = useLanguage();

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <div className="max-w-2xl mx-auto">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center">
                        {t.shippingReturns.title[lang]}
                    </h1>

                    {/* Shipping */}
                    <div className="mt-12">
                        <h2 className="font-heading text-title font-bold uppercase tracking-tight">
                            {t.shippingReturns.shippingTitle[lang]}
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {t.shippingReturns.shippingText[lang].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-vant-light/70 font-body leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-vant-purple rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="divider my-12" />

                    {/* Returns */}
                    <div>
                        <h2 className="font-heading text-title font-bold uppercase tracking-tight">
                            {t.shippingReturns.returnsTitle[lang]}
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {t.shippingReturns.returnsText[lang].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-vant-light/70 font-body leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-vant-purple rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
