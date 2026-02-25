import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gizlilik Politikası',
    description: 'VANT gizlilik politikası.',
};

const sections = [
    {
        title: 'Kişisel Verilerin İşlenmesi',
        content: [
            'VANT olarak ziyaretçilerimizin kişisel verilerini 6698 sayılı KVKK ve ilgili mevzuat çerçevesinde işlemekteyiz.',
            'Topladığımız veriler: ad, soyad, e-posta adresi, telefon numarası, teslimat adresi.',
            'Bu veriler; sipariş işlemleri, müşteri hizmetleri ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.',
        ],
    },
    {
        title: 'Verilerin Saklanması ve Güvenliği',
        content: [
            'Kişisel verileriniz güvenli sunucularda saklanmaktadır.',
            'Üçüncü taraflarla verileriniz yalnızca yasal zorunluluk veya sipariş teslimatı için paylaşılır.',
            'Verilerinize yetkisiz erişimi önlemek için teknik ve idari tedbirler alınmaktadır.',
        ],
    },
    {
        title: 'Haklarınız',
        content: [
            'KVKK kapsamında kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarına sahipsiniz.',
            'Talepleriniz için: iletisim@vantonline.com',
        ],
    },
    {
        title: 'Çerezler',
        content: [
            'Sitemiz; kullanım deneyimini iyileştirmek amacıyla çerezler kullanmaktadır.',
            'Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz.',
        ],
    },
];

export default function PrivacyPage() {
    return (
        <section className="container-vant py-12 md:py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-display font-bold uppercase tracking-tight mb-10">
                    Gizlilik Politikası
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
