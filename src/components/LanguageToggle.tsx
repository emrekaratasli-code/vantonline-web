'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    return (
        <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="relative flex items-center gap-1 text-xs font-heading uppercase tracking-widest text-vant-muted hover:text-vant-light transition-colors duration-300"
            aria-label="Toggle language"
        >
            <span className={lang === 'tr' ? 'text-vant-light' : 'text-vant-muted'}>TR</span>
            <span className="text-vant-light/20">/</span>
            <span className={lang === 'en' ? 'text-vant-light' : 'text-vant-muted'}>EN</span>
        </button>
    );
}
