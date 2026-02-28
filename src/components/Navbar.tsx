'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';
import CartIcon from './CartIcon';

type NavbarVariant = 'default' | 'home-neo-grunge';

interface NavbarProps {
    variant?: NavbarVariant;
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { lang, t } = useLanguage();
    const isHomeNeo = variant === 'home-neo-grunge';

    const navLinks = [
        { href: '/drop', label: t.nav.drop[lang] },
        { href: '/lookbook', label: t.nav.lookbook[lang] },
        { href: '/about', label: t.nav.about[lang] },
        { href: '/contact', label: t.nav.contact[lang] },
    ];

    const desktopLinkClass = isHomeNeo
        ? 'font-heading text-xs uppercase tracking-[0.2em] text-vant-light hover:text-vant-purple transition-colors duration-200'
        : 'nav-link font-heading text-xs uppercase tracking-[0.15em]';

    const iconButtonClass = isHomeNeo
        ? 'text-vant-muted hover:text-vant-purple transition-colors duration-200'
        : 'text-vant-muted hover:text-vant-light transition-colors duration-300';

    const mobilePanelClass = isHomeNeo
        ? 'md:hidden bg-vant-black/95 border-t border-vant-light/20 overflow-hidden'
        : 'md:hidden bg-vant-black border-t border-vant-light/5 overflow-hidden';

    const mobileLinkClass = isHomeNeo
        ? 'font-heading text-lg uppercase tracking-[0.18em] text-vant-light/90 hover:text-vant-purple transition-colors duration-200'
        : 'font-heading text-lg uppercase tracking-[0.15em] text-vant-light/80 hover:text-vant-purple transition-colors duration-300';

    const searchPanelClass = isHomeNeo
        ? 'border-t border-vant-light/20 bg-vant-black/95'
        : 'border-t border-vant-light/10 bg-vant-black/90';

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    // Close search on outside click
    useEffect(() => {
        if (!searchOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchOpen]);

    const toggleSearch = () => {
        if (mobileOpen) setMobileOpen(false);
        setSearchOpen((prev) => !prev);
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        setSearchOpen(false);
        router.push(q ? `/drop?q=${encodeURIComponent(q)}` : '/drop');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 border-b ${isHomeNeo ? 'home-neo-header' : ''}`}
            style={{
                backgroundColor: isHomeNeo ? 'rgba(6, 6, 6, 0.88)' : 'var(--navbar-bg)',
                borderColor: isHomeNeo ? 'rgba(240, 238, 231, 0.16)' : 'var(--navbar-border)',
            }}
        >
            <nav className="container-vant flex items-center justify-between h-24 md:h-28">
                <Link
                    href="/"
                    className="block hover:opacity-80 transition-opacity duration-300"
                >
                    <Image
                        src="/images/logo-full.png"
                        alt="VANT Art"
                        width={400}
                        height={110}
                        className="h-20 md:h-28 w-auto object-contain scale-110 origin-left"
                        priority
                    />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={desktopLinkClass}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleSearch}
                        aria-label={t.nav.search[lang]}
                        className={iconButtonClass}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>

                    <CartIcon />
                    <LanguageToggle />

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-vant-light p-1"
                        aria-label="Menu"
                    >
                        <div className="w-5 flex flex-col gap-1.5">
                            <motion.span
                                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className={`block h-[1px] w-full ${isHomeNeo ? 'bg-vant-purple' : 'bg-vant-light'}`}
                            />
                            <motion.span
                                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                                className={`block h-[1px] w-full ${isHomeNeo ? 'bg-vant-purple' : 'bg-vant-light'}`}
                            />
                            <motion.span
                                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className={`block h-[1px] w-full ${isHomeNeo ? 'bg-vant-purple' : 'bg-vant-light'}`}
                            />
                        </div>
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        ref={searchPanelRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={searchPanelClass}
                    >
                        <div className="container-vant py-3">
                            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                                <input
                                    ref={searchInputRef}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setSearchOpen(false);
                                    }}
                                    placeholder={lang === 'tr' ? 'Urun ara...' : 'Search products...'}
                                    className="input-vant !py-2.5 !text-xs sm:!text-sm"
                                    aria-label={lang === 'tr' ? 'Urun ara' : 'Search products'}
                                />
                                <button type="submit" className="btn-secondary !px-4 !py-2.5 !text-xs">
                                    {lang === 'tr' ? 'Ara' : 'Search'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={mobilePanelClass}
                    >
                        <div className="container-vant py-8 flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={mobileLinkClass}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
