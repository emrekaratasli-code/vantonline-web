'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function NotFound() {
    const { lang, t } = useLanguage();

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-vant-black pt-32">
            <div className="text-center max-w-2xl px-4">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="font-heading text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-vant-purple to-vant-pink leading-none">
                        404
                    </h1>
                </div>

                {/* Heading */}
                <h2 className="font-heading text-2xl md:text-4xl uppercase tracking-[0.15em] text-vant-light mb-4">
                    {lang === 'tr' ? 'Sayfa Bulunamadı' : 'Page Not Found'}
                </h2>

                {/* Description */}
                <p className="text-vant-muted text-base md:text-lg font-body leading-relaxed mb-12">
                    {lang === 'tr'
                        ? 'Aradığınız sayfa mevcut değil. Ana sayfaya dönüp alışverişe devam edebilirsiniz.'
                        : 'The page you are looking for does not exist. Return to the homepage to continue shopping.'}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-vant-purple hover:bg-vant-purple/80 text-white font-heading text-sm uppercase tracking-[0.15em] transition-colors duration-300"
                    >
                        {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
                    </Link>
                    <Link
                        href="/drop"
                        className="inline-block px-8 py-3 border border-vant-light/30 hover:border-vant-purple text-vant-light hover:text-vant-purple font-heading text-sm uppercase tracking-[0.15em] transition-colors duration-300"
                    >
                        {lang === 'tr' ? 'Ürünleri Gör' : 'View Products'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
