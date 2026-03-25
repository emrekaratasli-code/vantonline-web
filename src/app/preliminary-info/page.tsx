import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ön Bilgilendirme Formu',
    description: 'VANT ön bilgilendirme formu, sipariş, teslimat, ödeme ve iade koşullarını özetler.',
};

const sections = [
    {
        title: 'Sözleşme Konusu',
        content: [
            'Bu formun konusu, ALICI\'nın SATICI\'ya ait internet sitesinden siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince bilgilendirilmesidir.',
        ],
    },
    {
        title: 'Satıcı Bilgileri',
        content: [
            'Unvan: VANT',
            'E-posta: iletisim@vantonline.com',
            'İade Adresi: Sipariş onay e-postasında belirtilen adrestir.',
        ],
    },
    {
        title: 'Ürün ve Ödeme Bilgileri',
        content: [
            'Ürünün türü, miktarı, satış bedeli ve ödeme şekli siparişin verildiği andaki bilgilerden oluşmaktadır.',
            'Kargo ücreti teslimat adresine göre ödeme adımında hesaplanır ve sipariş özeti ekranında gösterilir.',
        ],
    },
    {
        title: 'Teslimat Bilgileri',
        content: [
            'Teslimat, kargo firması aracılığı ile ALICI\'nın belirtmiş olduğu adrese yapılacaktır.',
            'Teslimat süresi sipariş onayından itibaren en geç 30 gündür.',
        ],
    },
    {
        title: 'Cayma Hakkı',
        content: [
            'ALICI, ürünü teslim aldığı tarihten itibaren 14 gün içinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.',
            'Cayma hakkının kullanılması için SATICI\'ya bu süre içinde e-posta ile bildirimde bulunulmalıdır.',
        ],
    },
];

export default function PreliminaryInfoPage() {
    return (
        <section className="container-vant py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-display font-bold uppercase tracking-tight mb-10">
                    Ön Bilgilendirme Formu
                </h1>
                <p className="text-xs text-vant-muted mb-8">Son güncelleme: Mart 2026</p>

                {sections.map((section) => (
                    <div key={section.title} className="mb-10">
                        <h2 className="font-heading text-base uppercase tracking-wide text-vant-light mb-3">
                            {section.title}
                        </h2>
                        <ul className="space-y-2">
                            {section.content.map((line, index) => (
                                <li key={index} className="text-sm text-vant-muted font-body leading-relaxed">
                                    - {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="mt-12 pt-8 border-t border-vant-light/5 flex flex-wrap gap-3">
                    <Link href="/distance-sales" className="btn-outline text-xs">
                        Mesafeli Satış Sözleşmesi
                    </Link>
                    <Link href="/" className="btn-outline text-xs">
                        Ana Sayfa
                    </Link>
                </div>
            </div>
        </section>
    );
}
