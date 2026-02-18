'use client';

import { LanguageProvider } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MetaPixel from '@/components/MetaPixel';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <MetaPixel />
            <Navbar />
            <main className="min-h-screen pt-16 md:pt-20">{children}</main>
            <Footer />
        </LanguageProvider>
    );
}
