'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';
import CartIcon from './CartIcon';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { lang, t } = useLanguage();

    const navLinks = [
        { href: '/drop', label: t.nav.drop[lang] },
        { href: '/lookbook', label: t.nav.lookbook[lang] },
        { href: '/about', label: t.nav.about[lang] },
        { href: '/contact', label: t.nav.contact[lang] },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40 transition-colors duration-300 border-b"
            style={{
                backgroundColor: 'var(--navbar-bg)',
                borderColor: 'var(--navbar-border)',
            }}
        >
            <nav className="container-vant flex items-center justify-between h-24 md:h-28">
                {/* Logo */}
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

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="nav-link font-heading text-xs uppercase tracking-[0.15em]">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Search icon */}
                    <button
                        aria-label={t.nav.search[lang]}
                        className="text-vant-muted hover:text-vant-light transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>

                    <CartIcon />
                    <ThemeToggle />
                    <LanguageToggle />

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden text-vant-light p-1"
                        aria-label="Menu"
                    >
                        <div className="w-5 flex flex-col gap-1.5">
                            <motion.span
                                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className="block h-[1px] w-full bg-vant-light"
                            />
                            <motion.span
                                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="block h-[1px] w-full bg-vant-light"
                            />
                            <motion.span
                                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className="block h-[1px] w-full bg-vant-light"
                            />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden bg-vant-black border-t border-vant-light/5 overflow-hidden"
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
                                        className="font-heading text-lg uppercase tracking-[0.15em] text-vant-light/80 hover:text-vant-purple transition-colors duration-300"
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
