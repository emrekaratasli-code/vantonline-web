'use client';

import { usePathname } from 'next/navigation';
import { LanguageProvider } from '@/lib/i18n';
import { CartProvider } from '@/lib/CartContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MetaPixel from '@/components/MetaPixel';
import JarvisWidget from '@/components/JarvisWidget';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const variant = pathname === '/' ? 'home-neo-grunge' : 'default';

    return (
        <ThemeProvider>
            <LanguageProvider>
                <CartProvider>
                    <MetaPixel />
                    <Navbar variant={variant} />
                    <main className="min-h-screen pt-24 md:pt-28">{children}</main>
                    <Footer variant={variant} />
                    <JarvisWidget />
                </CartProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
