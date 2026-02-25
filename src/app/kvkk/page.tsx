import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'KVKK Aydınlatma Metni',
    description: 'VANT KVKK aydınlatma metni.',
};

const sections = [
    {
        title: 'Veri Sorumlusu',
        content: ['Veri sorumlusu: VANT (vantonline.com)', 'İletişim: iletisim@vantonline.com'],
    },
    {
        title: 'Hangi Veriler İşleniyor?',
        content: [
            'Ad, soyad, telefon numarası, e-posta adresi, teslimat ve fatura adresi.',
            'IP adresi ve tarayıcı bilgileri (teknik zorunluluk).',
        ],
    },
    {
        title: 'İşleme Amaçları ve Hukuki Dayanak',
        content: [
            'Sipariş ve teslimat süreçlerinin yürütülmesi — Sözleşmenin ifası.',
            'Müşteri hizmetleri ve şikayet yönetimi — Meşru menfaat.',
            'Pazarlama iletişimi (onayınız varsa) — Açık rıza.',
            'Yasal yükümlülüklerin yerine getirilmesi — Kanuni zorunluluk.',
        ],
    },
    {
        title: 'Yurt Dışı Aktarım',
        content: [
            "Verileriniz; e-posta altyapısı ve ödeme sistemleri kapsamında yurt dışındaki iş ortaklarına aktarılabilir.",
            "Söz konusu aktarımlar KVKK'nın 9. maddesi çerçevesinde gerçekleştirilmektedir.",
        ],
    },
    {
        title: 'Haklarınız (KVKK Madde 11)',
        content: [
            'Kişisel verilerinize erişim hakkı',
            'Düzeltme ve silme talep etme hakkı',
            'İşlemenin kısıtlanmasını talep hakkı',
            'İtiraz hakkı',
            'Talep için: iletisim@vantonline.com',
        ],
    },
];

export default function KvkkPage() {
    return (
        <section className="container-vant py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-display font-bold uppercase tracking-tight mb-10">
                    KVKK Aydınlatma Metni
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
