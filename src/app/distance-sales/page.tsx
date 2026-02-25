import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'VANT mesafeli satış sözleşmesi ve ön bilgilendirme formu.',
};

const sections = [
    {
        title: 'Satıcı Bilgileri',
        content: ['Satıcı: VANT', 'Web sitesi: vantonline.com', 'E-posta: iletisim@vantonline.com'],
    },
    {
        title: 'Sözleşme Konusu',
        content: [
            'Bu sözleşme, alıcının web sitesi üzerinden satın aldığı ürünlere ilişkin hak ve yükümlülükleri düzenler.',
            'Ürün özellikleri ve fiyatlar sipariş özeti sayfasında açıkça belirtilmektedir.',
        ],
    },
    {
        title: 'Teslimat',
        content: [
            'Ürünler, sipariş onayından sonra 1–3 iş günü içinde kargoya verilir.',
            'Tahmini teslimat süresi 2–5 iş günüdür.',
            'Türkiye genelinde ücretsiz kargo uygulanır.',
        ],
    },
    {
        title: 'Cayma Hakkı',
        content: [
            'Teslim tarihinden itibaren 14 gün içinde cayma hakkı kullanılabilir.',
            'Ürünün kullanılmamış, yıkanmamış ve etiketinin sökülmemiş olması gerekir.',
            'Cayma bildirimi için: iletisim@vantonline.com',
        ],
    },
    {
        title: 'İade ve Para İadesi',
        content: [
            'Ürün iadesi onaylandıktan sonra 3–5 iş günü içinde ödeme iadesi yapılır.',
            'İade kargo ücreti alıcıya aittir.',
        ],
    },
    {
        title: 'Uyuşmazlık Çözümü',
        content: [
            'Şikayetler için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.',
            "E-devlet üzerinden Tüketici Bilgi Sistemi'ne (TUBİS) başvurabilirsiniz.",
        ],
    },
];

export default function DistanceSalesPage() {
    return (
        <section className="container-vant py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-display font-bold uppercase tracking-tight mb-10">
                    Mesafeli Satış Sözleşmesi
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
