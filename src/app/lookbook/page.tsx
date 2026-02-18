'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import FadeIn from '@/components/FadeIn';

const lookbookImages = Array.from({ length: 8 }, (_, i) => ({
    src: `/images/lookbook/look-${i + 1}.jpg`,
    caption: {
        tr: [
            'Purple Slash Tee — Sokağın sessiz gücü.',
            'Void Hoodie ile gece yürüyüşü.',
            'Manifesto Tee — Cesaretin dili.',
            'Nocturnal — Gece kültürüne adanmış.',
            'Şehrin hayaletleri.',
            'Oversize kesim, minimal detay.',
            'Siyah üzerine mor — VANT imzası.',
            'Hatırlanmak için giyinmek.'
        ][i],
        en: [
            'Purple Slash Tee — The quiet power of the street.',
            'Night walk with the Void Hoodie.',
            'Manifesto Tee — The language of courage.',
            'Nocturnal — Dedicated to night culture.',
            'Ghosts of the city.',
            'Oversized cut, minimal detail.',
            'Purple on black — the VANT signature.',
            'Dressing to be remembered.'
        ][i],
    },
}));

export default function LookbookPage() {
    const { lang, t } = useLanguage();

    return (
        <section className="container-vant py-12 md:py-20">
            {/* Header */}
            <FadeIn>
                <div className="text-center mb-16">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.lookbook.title[lang]}
                    </h1>
                    <p className="mt-4 text-sm text-vant-muted max-w-md mx-auto">
                        {t.lookbook.subtitle[lang]}
                    </p>
                </div>
            </FadeIn>

            {/* Editorial grid — magazine-like asymmetric layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {lookbookImages.map((img, i) => (
                    <FadeIn key={i} delay={i * 0.05}>
                        <div className={`group relative overflow-hidden ${i % 3 === 0 ? 'md:col-span-2' : ''
                            }`}>
                            <div className={`relative bg-vant-gray overflow-hidden ${i % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[3/4]'
                                }`}>
                                <Image
                                    src={img.src}
                                    alt={img.caption[lang]}
                                    fill
                                    sizes={i % 3 === 0 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-vant-black/0 group-hover:bg-vant-black/40 transition-all duration-500 flex items-end">
                                    <p className="p-6 text-sm font-body text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        {img.caption[lang]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}
