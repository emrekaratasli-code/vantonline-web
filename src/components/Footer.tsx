'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
    const { lang, t } = useLanguage();

    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-vant-light/5 bg-vant-black">
            <div className="container-vant py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="block w-24 mb-4 hover:opacity-80 transition-opacity">
                            <Image
                                src="/images/logo-full.png"
                                alt="VANT"
                                width={100}
                                height={33}
                                className="w-full h-auto object-contain"
                            />
                        </Link>
                        <p className="mt-3 text-sm text-vant-muted font-body leading-relaxed">
                            {t.footer.tagline[lang]}
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light mb-4">
                            {t.footer.links[lang]}
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/drop" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.drop[lang]}</Link></li>
                            <li><Link href="/lookbook" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.lookbook[lang]}</Link></li>
                            <li><Link href="/about" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.about[lang]}</Link></li>
                            <li><Link href="/size" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.size[lang]}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light mb-4">
                            {t.footer.legal[lang]}
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/shipping-returns" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.shipping[lang]}</Link></li>
                            <li><Link href="/contact" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{t.nav.contact[lang]}</Link></li>
                            <li><span className="text-sm text-vant-muted/40">{t.footer.accessories[lang]}</span></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light mb-4">
                            {t.footer.social[lang]}
                        </h4>
                        <div className="flex gap-4">
                            <a
                                href="https://instagram.com/vant"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-vant-muted hover:text-vant-purple transition-colors"
                                aria-label="Instagram"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><path d="M17.5 6.5h.01" />
                                </svg>
                            </a>
                            <a
                                href="https://twitter.com/vant"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-vant-muted hover:text-vant-purple transition-colors"
                                aria-label="X / Twitter"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4l11.733 16h4.267l-11.733-16z" /><path d="M4 20l6.768-6.768" /><path d="M20 4l-6.768 6.768" />
                                </svg>
                            </a>
                            <a
                                href="https://tiktok.com/@vant"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-vant-muted hover:text-vant-purple transition-colors"
                                aria-label="TikTok"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-vant-light/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-vant-muted/60">
                        © {currentYear} VANT. {t.footer.rights[lang]}
                    </p>
                    <p className="text-xs text-vant-muted/40 font-heading tracking-widest uppercase">
                        Purple Slash
                    </p>
                </div>
            </div>
        </footer>
    );
}
