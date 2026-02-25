import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kullanım Koşulları',
    description: 'VANT kullanım koşulları.',
};

const sections = [
    {
        title: 'Kapsam',
        content: [
            'Bu kullanım koşulları, vantonline.com adresinde yayınlanan VANT web sitesini kullanan tüm ziyaretçiler için geçerlidir.',
            'Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.',
        ],
    },
    {
        title: 'Kullanım Kuralları',
        content: [
            "Sitedeki içerikler (görsel, metin, logo) VANT'a aittir ve izinsiz kullanılamaz.",
            'Siteyi hukuka aykırı, yanıltıcı veya zararlı amaçlarla kullanamazsınız.',
            'Sistemlere izinsiz erişim girişimleri yasaktır.',
        ],
    },
    {
        title: 'Ürün ve Fiyat Bilgileri',
        content: [
            'Ürün bilgileri ve fiyatlar önceden bildirimde bulunmaksızın değiştirilebilir.',
            'Sipariş onayı, stok kontrolünden sonra tarafınıza iletilir.',
        ],
    },
    {
        title: 'Sorumluluk Sınırlaması',
        content: [
            'VANT, teknik arızalar veya üçüncü taraf kaynaklı aksaklıklardan doğan zararlardan sorumlu tutulamaz.',
        ],
    },
    {
        title: 'Uygulanacak Hukuk',
        content: ["Bu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri yetkilidir."],
    },
];

export default function TermsPage() {
    return (
        <section className="container-vant py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-display font-bold uppercase tracking-tight mb-10">
                    Kullanım Koşulları
                </h1>
                <p className="text-xs text-vant-muted mb-8">Son güncelleme: Şubat 2026</p>

                {sections.map((s) => (
                    <div key={s.title} className="mb-10">
                        <h2 className="font-heading text-base uppercase tracking-wide text-vant-light mb-3">{s.title}</h2>
                        <ul className="space-y-2">
                            {s.content.map((line, i) => (
                                <li key={i} className="text-sm text-vant-muted font-body leading-relaxed">— {line}</li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="mt-12 pt-8 border-t border-vant-light/5">
                    <Link href="/" className="btn-outline text-xs">← Ana Sayfa</Link>
                </div>
            </div>
        </section>
    );
}
