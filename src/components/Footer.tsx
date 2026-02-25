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
                        <Link href="/" className="block w-32 mb-4 hover:opacity-80 transition-opacity">
                            <Image
                                src="/images/logo-full.png"
                                alt="VANT Art"
                                width={180}
                                height={52}
                                className="w-full h-auto object-contain"
                                loading="lazy"
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
                            <li><Link href="/privacy" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{lang === 'tr' ? 'Gizlilik' : 'Privacy'}</Link></li>
                            <li><Link href="/kvkk" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">KVKK</Link></li>
                            <li><Link href="/terms" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{lang === 'tr' ? 'Kullanım Koşulları' : 'Terms'}</Link></li>
                            <li><Link href="/distance-sales" className="text-sm text-vant-muted hover:text-vant-purple transition-colors">{lang === 'tr' ? 'Mesafeli Satış' : 'Distance Sales'}</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-heading text-xs uppercase tracking-[0.15em] text-vant-light mb-4">
                            {t.footer.social[lang]}
                        </h4>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/vantartonline?utm_source=qr"
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
                                href="https://www.tiktok.com/@vant.taki.aksesuar?_r=1&_t=ZS-948plUHKRmB"
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
                    © {currentYear} VANT Art. {t.footer.rights[lang]}
                    <p className="text-xs text-vant-muted/40 font-heading tracking-widest uppercase">
                        Purple Slash
                    </p>
                </div>
            </div>
        </footer>
    );
}
