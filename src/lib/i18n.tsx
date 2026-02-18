'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Lang = 'tr' | 'en';

const translations = {
    nav: {
        drop: { tr: 'Drop', en: 'Drop' },
        lookbook: { tr: 'Lookbook', en: 'Lookbook' },
        about: { tr: 'Hakkımızda', en: 'About' },
        contact: { tr: 'İletişim', en: 'Contact' },
        size: { tr: 'Beden Rehberi', en: 'Size Guide' },
        shipping: { tr: 'Kargo & İade', en: 'Shipping & Returns' },
        search: { tr: 'Ara', en: 'Search' },
    },
    hero: {
        headline: { tr: 'VANT — Hatırlanmak için.', en: 'VANT — Made to be remembered.' },
        subtext: {
            tr: 'Purple Slash koleksiyonu şimdi yayında. Sınırlı üretim, sınırsız tutku.',
            en: 'Purple Slash collection is now live. Limited production, limitless passion.',
        },
        cta: { tr: "Drop'u Keşfet", en: 'Explore the Drop' },
        ctaSecondary: { tr: 'Lookbook', en: 'Lookbook' },
    },
    featured: {
        title: { tr: 'Öne Çıkanlar', en: 'Featured' },
    },
    manifesto: {
        title: { tr: 'VANT Manifesto', en: 'VANT Manifesto' },
        text: {
            tr: 'VANT, kuralları reddeden bir duruş. Sokağın dilini konuşur, sessiz bir isyan taşır. Her parça sınırlı üretilir — çünkü gerçek değer, tekrar edilemeyende gizlidir. Biz trend takip etmeyiz; trendi biz başlatırız. Purple Slash sadece bir renk değil, bir manifestodur.',
            en: 'VANT is a defiance that rejects the rules. It speaks the language of the street, carrying a quiet rebellion. Every piece is produced in limited quantities — because true value lies in what cannot be replicated. We don\'t follow trends; we start them. Purple Slash is not just a color, it\'s a manifesto.',
        },
    },
    newsletter: {
        title: { tr: 'Drop\'lardan ilk sen haberdar ol.', en: 'Be the first to know about drops.' },
        placeholder: { tr: 'E-posta adresin', en: 'Your email address' },
        button: { tr: 'Kayıt Ol', en: 'Subscribe' },
        success: { tr: 'Kayıt başarılı!', en: 'Successfully subscribed!' },
        error: { tr: 'Geçerli bir e-posta girin.', en: 'Enter a valid email.' },
    },
    product: {
        inspect: { tr: 'İncele', en: 'View Details' },
        buyOnShopier: { tr: "Shopier'de Satın Al", en: 'Buy on Shopier' },
        outOfStock: { tr: 'Tükendi', en: 'Sold Out' },
        backToDrop: { tr: "Drop'a Dön", en: 'Back to Drop' },
        size: { tr: 'Beden', en: 'Size' },
        color: { tr: 'Renk', en: 'Color' },
        description: { tr: 'Açıklama', en: 'Description' },
        care: { tr: 'Bakım Talimatları', en: 'Care Instructions' },
        shipping: { tr: 'Kargo & İade', en: 'Shipping & Returns' },
        shippingInfo: {
            tr: 'Türkiye geneli ücretsiz kargo. 14 gün içinde koşulsuz iade.',
            en: 'Free shipping across Turkey. Unconditional return within 14 days.',
        },
        limitedEdition: { tr: 'Sınırlı Üretim', en: 'Limited Edition' },
        selectSize: { tr: 'Beden seçin', en: 'Select size' },
        currency: { tr: '₺', en: '₺' },
    },
    drop: {
        title: { tr: 'Drop', en: 'Drop' },
        subtitle: { tr: 'Sınırlı üretim. Stok bitince tekrar üretim planlanmaz.', en: 'Limited production. No restock once sold out.' },
        all: { tr: 'Tümü', en: 'All' },
        tshirt: { tr: 'T-Shirt', en: 'T-Shirt' },
        hoodie: { tr: 'Hoodie', en: 'Hoodie' },
        sortPrice: { tr: 'Fiyata göre sırala', en: 'Sort by price' },
        lowToHigh: { tr: 'Düşükten yükseğe', en: 'Low to high' },
        highToLow: { tr: 'Yüksekten düşüğe', en: 'High to low' },
        noSort: { tr: 'Varsayılan', en: 'Default' },
    },
    lookbook: {
        title: { tr: 'Lookbook', en: 'Lookbook' },
        subtitle: { tr: 'Purple Slash — Sessiz isyanın görsel dili.', en: 'Purple Slash — The visual language of quiet rebellion.' },
    },
    about: {
        title: { tr: 'Hakkımızda', en: 'About Us' },
        story: {
            tr: 'VANT, 2024 yılında İstanbul\'un sokaklarında doğdu. Tek bir inançla: giyim sadece bir ihtiyaç değil, bir ifade biçimidir. Her parçamız sokak kültürünün cesaretini, minimal tasarımın zarafetini ve sınırlı üretimin değerini taşır.',
            en: 'VANT was born on the streets of Istanbul in 2024. With a single belief: clothing is not just a necessity, but a form of expression. Every piece carries the courage of street culture, the elegance of minimal design, and the value of limited production.',
        },
        manifesto: {
            tr: 'Biz trend takip etmeyiz — biz başlatırız. Purple Slash sadece bir renk değil, bir duruştur. VANT giyen herkes sessiz bir isyanı taşır. Kuralları biz koymadık, ama onları kırmayı biz seçtik.',
            en: 'We don\'t follow trends — we start them. Purple Slash is not just a color, it\'s a stance. Everyone who wears VANT carries a quiet rebellion. We didn\'t make the rules, but we chose to break them.',
        },
        values: {
            tr: ['Sınırlı Üretim', 'Sürdürülebilir Malzeme', 'Türk Tasarımı', 'Sokak Kültürü'],
            en: ['Limited Production', 'Sustainable Materials', 'Turkish Design', 'Street Culture'],
        },
    },
    sizeGuide: {
        title: { tr: 'Beden Rehberi', en: 'Size Guide' },
        subtitle: { tr: 'Tüm ürünlerimiz oversize kesimdir. Normal bedeninizi alabilirsiniz.', en: 'All our products have an oversized cut. You can order your regular size.' },
        chest: { tr: 'Göğüs (cm)', en: 'Chest (cm)' },
        length: { tr: 'Boy (cm)', en: 'Length (cm)' },
        shoulder: { tr: 'Omuz (cm)', en: 'Shoulder (cm)' },
        sleeve: { tr: 'Kol (cm)', en: 'Sleeve (cm)' },
        care: { tr: 'Bakım & Yıkama', en: 'Care & Washing' },
        careItems: {
            tr: [
                'Maksimum 30°C\'de yıkayın.',
                'Ters çevirerek yıkama yapın.',
                'Baskılı ürünleri düşük ısıda ütüleyin, baskı üzerine doğrudan ütü yapmayın.',
                'Çamaşır suyu / ağartıcı kullanmayın.',
                'Kurutma makinesine atmayın — asarak kurutun.',
            ],
            en: [
                'Wash at max 30°C.',
                'Wash inside out.',
                'Iron printed products on low heat, do not iron directly on print.',
                'Do not use bleach.',
                'Do not tumble dry — hang dry.',
            ],
        },
    },
    shippingReturns: {
        title: { tr: 'Kargo & İade', en: 'Shipping & Returns' },
        shippingTitle: { tr: 'Kargo Bilgileri', en: 'Shipping Information' },
        shippingText: {
            tr: [
                'Türkiye genelinde ücretsiz kargo.',
                'Siparişler 1-3 iş günü içinde kargoya verilir.',
                'Tahmini teslimat süresi: 2-5 iş günü.',
                'Kargo takip numarası e-posta ile gönderilir.',
            ],
            en: [
                'Free shipping across Turkey.',
                'Orders are shipped within 1-3 business days.',
                'Estimated delivery time: 2-5 business days.',
                'Tracking number will be sent via email.',
            ],
        },
        returnsTitle: { tr: 'İade Politikası', en: 'Return Policy' },
        returnsText: {
            tr: [
                'Ürünler teslim tarihinden itibaren 14 gün içinde iade edilebilir.',
                'Ürünün kullanılmamış, yıkanmamış ve etiketinin sökülmemiş olması gerekmektedir.',
                'İade kargo ücreti alıcıya aittir.',
                'İade onayı sonrası 3-5 iş günü içinde ödeme iadesi yapılır.',
                'İade talebi için info@vant.com.tr adresine e-posta gönderin.',
            ],
            en: [
                'Products can be returned within 14 days of delivery.',
                'Products must be unused, unwashed, and with tags attached.',
                'Return shipping costs are borne by the buyer.',
                'Refund will be processed within 3-5 business days after return approval.',
                'For return requests, email info@vant.com.tr.',
            ],
        },
    },
    contact: {
        title: { tr: 'İletişim', en: 'Contact' },
        subtitle: { tr: 'Sorularınız için bize ulaşın.', en: 'Reach out to us with your questions.' },
        name: { tr: 'Adınız', en: 'Your Name' },
        email: { tr: 'E-posta', en: 'Email' },
        message: { tr: 'Mesajınız', en: 'Your Message' },
        send: { tr: 'Gönder', en: 'Send' },
        success: { tr: 'Mesajınız gönderildi. Teşekkürler!', en: 'Message sent. Thank you!' },
        errorName: { tr: 'İsim gerekli.', en: 'Name is required.' },
        errorEmail: { tr: 'Geçerli bir e-posta girin.', en: 'Enter a valid email.' },
        errorMessage: { tr: 'Mesaj gerekli.', en: 'Message is required.' },
    },
    footer: {
        tagline: { tr: 'Hatırlanmak için.', en: 'Made to be remembered.' },
        rights: { tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' },
        links: { tr: 'Bağlantılar', en: 'Links' },
        legal: { tr: 'Yasal', en: 'Legal' },
        social: { tr: 'Sosyal', en: 'Social' },
        accessories: { tr: 'Aksesuarlar — Çok Yakında', en: 'Accessories — Coming Soon' },
    },
} as const;

type Translations = typeof translations;

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'tr',
    setLang: () => { },
    t: translations,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>('tr');

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}

export function useTr<T extends { tr: string; en: string }>(obj: T): string {
    const { lang } = useLanguage();
    return obj[lang];
}
