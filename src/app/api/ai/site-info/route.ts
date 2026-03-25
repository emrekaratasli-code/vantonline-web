import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/apiAuth';

/**
 * GET /api/ai/site-info
 *
 * Returns brand info, shipping/return policies, size guide, contact, etc.
 * Query params:
 *   ?lang=tr|en — choose language (default: tr)
 */

const siteInfo = {
    brand: {
        name: 'VANT Art',
        tagline: { tr: 'Hatırlanmak için.', en: 'Made to be remembered.' },
        website: 'https://www.vantonline.com',
        email: 'iletisim@vantonline.com',
        description: {
            tr: 'VANT Art, kuralları reddeden bir duruş. Sokağın dilini konuşur, sessiz bir isyan taşır. Her parça sınırlı üretilir — çünkü gerçek değer, tekrar edilemeyende gizlidir.',
            en: 'VANT Art is a defiance that rejects the rules. It speaks the language of the street, carrying a quiet rebellion. Every piece is produced in limited quantities — because true value lies in what cannot be replicated.',
        },
        values: {
            tr: ['Sınırlı Üretim', 'Sürdürülebilir Malzeme', 'Türk Tasarımı', 'Sokak Kültürü'],
            en: ['Limited Production', 'Sustainable Materials', 'Turkish Design', 'Street Culture'],
        },
    },
    shipping: {
        title: { tr: 'Kargo Bilgileri', en: 'Shipping Information' },
        details: {
            tr: [
                'Kargo ücreti teslimat adresine göre ödeme adımında otomatik hesaplanır.',
                'Siparişler 1-3 iş günü içinde kargoya verilir.',
                'Tahmini teslimat süresi: 2-5 iş günü.',
                'Kargo takip numarası e-posta ile gönderilir.',
            ],
            en: [
                'Shipping fee is calculated at checkout based on the delivery address.',
                'Orders are shipped within 1-3 business days.',
                'Estimated delivery time: 2-5 business days.',
                'Tracking number will be sent via email.',
            ],
        },
    },
    returns: {
        title: { tr: 'İade Politikası', en: 'Return Policy' },
        details: {
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
    sizeGuide: {
        note: {
            tr: 'Tüm ürünlerimiz oversize kesimdir. Normal bedeninizi alabilirsiniz.',
            en: 'All our products have an oversized cut. You can order your regular size.',
        },
        care: {
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
};

export async function GET(req: NextRequest) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') === 'en' ? 'en' : 'tr') as 'tr' | 'en';

    // Flatten to selected language
    const data = {
        brand: {
            name: siteInfo.brand.name,
            tagline: siteInfo.brand.tagline[lang],
            website: siteInfo.brand.website,
            email: siteInfo.brand.email,
            description: siteInfo.brand.description[lang],
            values: siteInfo.brand.values[lang],
        },
        shipping: {
            title: siteInfo.shipping.title[lang],
            details: siteInfo.shipping.details[lang],
        },
        returns: {
            title: siteInfo.returns.title[lang],
            details: siteInfo.returns.details[lang],
        },
        sizeGuide: {
            note: siteInfo.sizeGuide.note[lang],
            care: siteInfo.sizeGuide.care[lang],
        },
    };

    return NextResponse.json({ ok: true, data });
}
