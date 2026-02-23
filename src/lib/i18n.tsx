'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

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
        headline: { tr: 'VANT Art — Hatırlanmak için.', en: 'VANT Art — Made to be remembered.' },
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
        title: { tr: 'VANT Art Manifesto', en: 'VANT Art Manifesto' },
        text: {
            tr: 'VANT Art, kuralları reddeden bir duruş. Sokağın dilini konuşur, sessiz bir isyan taşır. Her parça sınırlı üretilir — çünkü gerçek değer, tekrar edilemeyende gizlidir. Biz trend takip etmeyiz; trendi biz başlatırız. Purple Slash sadece bir renk değil, bir manifestodur.',
            en: 'VANT Art is a defiance that rejects the rules. It speaks the language of the street, carrying a quiet rebellion. Every piece is produced in limited quantities — because true value lies in what cannot be replicated. We don\'t follow trends; we start them. Purple Slash is not just a color, it\'s a manifesto.',
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
        addToCart: { tr: 'Sepete Ekle', en: 'Add to Cart' },
        addedToCart: { tr: 'Sepete eklendi!', en: 'Added to cart!' },
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
        selectSizeWarning: { tr: 'Lütfen bir beden seçin', en: 'Please select a size' },
        currency: { tr: '₺', en: '₺' },
        loading: { tr: 'Ürünler yükleniyor...', en: 'Loading products...' },
        noProducts: { tr: 'Henüz ürün bulunmuyor.', en: 'No products available yet.' },
    },
    cart: {
        title: { tr: 'Sepet', en: 'Cart' },
        empty: { tr: 'Sepetiniz boş.', en: 'Your cart is empty.' },
        total: { tr: 'Toplam', en: 'Total' },
        checkout: { tr: 'Ödemeye Geç', en: 'Proceed to Checkout' },
        remove: { tr: 'Kaldır', en: 'Remove' },
        clear: { tr: 'Sepeti Temizle', en: 'Clear Cart' },
        continueShopping: { tr: 'Alışverişe Devam Et', en: 'Continue Shopping' },
    },
    checkout: {
        title: { tr: 'Ödeme', en: 'Checkout' },
        stepShipping: { tr: 'Teslimat Bilgileri', en: 'Shipping Details' },
        stepOtp: { tr: 'Telefon Doğrulama', en: 'Phone Verification' },
        stepConsent: { tr: 'İletişim Tercihleri', en: 'Communication Preferences' },
        stepPayment: { tr: 'Ödeme', en: 'Payment' },
        firstName: { tr: 'Ad', en: 'First Name' },
        lastName: { tr: 'Soyad', en: 'Last Name' },
        email: { tr: 'E-posta (İsteğe Bağlı)', en: 'Email (Optional)' },
        phone: { tr: 'Telefon', en: 'Phone' },
        phonePlaceholder: { tr: '5XX XXX XX XX', en: '5XX XXX XX XX' },
        address: { tr: 'Adres', en: 'Address' },
        city: { tr: 'Şehir', en: 'City' },
        district: { tr: 'İlçe', en: 'District' },
        postalCode: { tr: 'Posta Kodu', en: 'Postal Code' },
        next: { tr: 'Devam', en: 'Continue' },
        back: { tr: 'Geri', en: 'Back' },
        required: { tr: 'Bu alan zorunludur', en: 'This field is required' },
        invalidEmail: { tr: 'Geçerli bir e-posta girin', en: 'Enter a valid email' },
        invalidPhone: { tr: 'Geçerli bir telefon numarası girin', en: 'Enter a valid phone number' },
    },
    otp: {
        enterPhone: { tr: 'Telefon numaranıza bir doğrulama kodu göndereceğiz.', en: 'We will send a verification code to your phone number.' },
        sendCode: { tr: 'Kod Gönder', en: 'Send Code' },
        enterCode: { tr: 'Doğrulama kodunu girin', en: 'Enter verification code' },
        codeSent: { tr: 'Doğrulama kodu gönderildi.', en: 'Verification code sent.' },
        verify: { tr: 'Doğrula', en: 'Verify' },
        resend: { tr: 'Tekrar Gönder', en: 'Resend' },
        verified: { tr: 'Telefon doğrulandı!', en: 'Phone verified!' },
        invalidCode: { tr: 'Geçersiz kod. Tekrar deneyin.', en: 'Invalid code. Please try again.' },
        tooManyAttempts: { tr: 'Çok fazla deneme. Daha sonra tekrar deneyin.', en: 'Too many attempts. Please try again later.' },
        error: { tr: 'Bir hata oluştu. Tekrar deneyin.', en: 'An error occurred. Please try again.' },
    },
    consent: {
        transactionalNote: {
            tr: 'Siparişinizle ilgili bilgilendirmeler (örn. kargo durumu) bu iletişim bilgileriyle gönderilebilir.',
            en: 'Order-related notifications (e.g. shipping updates) may be sent to these contact details.',
        },
        marketingSms: { tr: 'Kampanya SMS\'i almak istiyorum', en: 'I want to receive promotional SMS' },
        marketingEmail: { tr: 'Kampanya e-postası almak istiyorum', en: 'I want to receive promotional emails' },
        optOutNote: {
            tr: 'İstediğiniz zaman vazgeçebilirsiniz.',
            en: 'You can opt out at any time.',
        },
    },
    payment: {
        comingSoon: { tr: 'Ödeme Sistemi Yakında', en: 'Payment Coming Soon' },
        comingSoonMsg: {
            tr: 'Ödeme sistemi yakında aktif olacak. Siparişinizi şimdilik oluşturamıyoruz ancak sepetiniz kaydedildi.',
            en: 'Payment system will be active soon. We cannot process your order yet, but your cart is saved.',
        },
        orderSummary: { tr: 'Sipariş Özeti', en: 'Order Summary' },
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
            tr: 'VANT Art, 2024 yılında İstanbul\'un sokaklarında doğdu. Tek bir inançla: giyim sadece bir ihtiyaç değil, bir ifade biçimidir. Her parçamız sokak kültürünün cesaretini, minimal tasarımın zarafetini ve sınırlı üretimin değerini taşır.',
            en: 'VANT Art was born on the streets of Istanbul in 2024. With a single belief: clothing is not just a necessity, but a form of expression. Every piece carries the courage of street culture, the elegance of minimal design, and the value of limited production.',
        },
        manifesto: {
            tr: 'Biz trend takip etmeyiz — biz başlatırız. Purple Slash sadece bir renk değil, bir duruştur. VANT Art giyen herkes sessiz bir isyanı taşır. Kuralları biz koymadık, ama onları kırmayı biz seçtik.',
            en: 'We don\'t follow trends — we start them. Purple Slash is not just a color, it\'s a stance. Everyone who wears VANT Art carries a quiet rebellion. We didn\'t make the rules, but we chose to break them.',
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
                'İade talebi için iletisim@vantonline.com adresine e-posta gönderin.',
            ],
            en: [
                'Products can be returned within 14 days of delivery.',
                'Products must be unused, unwashed, and with tags attached.',
                'Return shipping costs are borne by the buyer.',
                'Refund will be processed within 3-5 business days after return approval.',
                'For return requests, email iletisim@vantonline.com.',
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
    const [lang, setLangState] = useState<Lang>('tr');
    const [mounted, setMounted] = useState(false);

    // Hydrate from localStorage after first mount (avoids SSR mismatch)
    useEffect(() => {
        try {
            const stored = localStorage.getItem('vant-lang') as Lang | null;
            if (stored === 'tr' || stored === 'en') {
                setLangState(stored);
            }
        } catch {
            // localStorage not available (private mode etc.)
        }
        setMounted(true);
    }, []);

    const setLang = useCallback((newLang: Lang) => {
        setLangState(newLang);
        try {
            localStorage.setItem('vant-lang', newLang);
        } catch {
            // ignore
        }
    }, []);

    // Render with default 'tr' until mounted to avoid hydration mismatch
    return (
        <LanguageContext.Provider value={{ lang: mounted ? lang : 'tr', setLang, t: translations }}>
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
