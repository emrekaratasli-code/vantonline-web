'use client';

import { LanguageProvider } from '@/lib/i18n';
import { CartProvider } from '@/lib/CartContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MetaPixel from '@/components/MetaPixel';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <CartProvider>
                    <MetaPixel />
                    <Navbar />
                    <main className="min-h-screen pt-24 md:pt-28">{children}</main>
                    <Footer />
                </CartProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
