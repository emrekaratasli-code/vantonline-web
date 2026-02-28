'use client';

import { useLanguage } from '@/lib/i18n';
import FadeIn from '@/components/FadeIn';

export default function AboutPage() {
    const { lang, t } = useLanguage();

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <div className="max-w-2xl mx-auto">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center">
                        {t.about.title[lang]}
                    </h1>

                    <div className="mt-12 space-y-10">
                        <p className="text-base md:text-lg text-vant-muted/60 font-body leading-[1.8]">
                            {t.about.corporateIntro[lang]}
                        </p>

                        {/* Bold dismissal */}
                        <p className="text-xl md:text-2xl text-vant-light font-heading font-bold">
                            {t.about.story[lang]}
                        </p>

                        <div className="w-12 h-[2px] bg-vant-purple" />

                        {/* The real story */}
                        <p className="text-base md:text-lg text-vant-light/90 font-body leading-[1.9]">
                            {t.about.storyBody[lang]}
                        </p>


                    </div>
                </div>
            </FadeIn>

            {/* Values */}
            <FadeIn delay={0.2}>
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {t.about.values[lang].map((value, i) => (
                        <div key={i} className="text-center p-6 border border-vant-light/5 hover:border-vant-purple/20 transition-colors duration-500">
                            <span className="block font-heading text-3xl font-bold text-vant-purple mb-3">
                                0{i + 1}
                            </span>
                            <span className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light">
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </section>
    );
}

