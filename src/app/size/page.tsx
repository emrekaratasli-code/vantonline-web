'use client';

import { useLanguage } from '@/lib/i18n';
import FadeIn from '@/components/FadeIn';

const sizeData = {
    tshirt: [
        { size: 'S', chest: '54', length: '72', shoulder: '52', sleeve: '24' },
        { size: 'M', chest: '57', length: '74', shoulder: '54', sleeve: '25' },
        { size: 'L', chest: '60', length: '76', shoulder: '56', sleeve: '26' },
        { size: 'XL', chest: '63', length: '78', shoulder: '58', sleeve: '27' },
    ],
    hoodie: [
        { size: 'S', chest: '58', length: '70', shoulder: '54', sleeve: '62' },
        { size: 'M', chest: '61', length: '72', shoulder: '56', sleeve: '64' },
        { size: 'L', chest: '64', length: '74', shoulder: '58', sleeve: '66' },
        { size: 'XL', chest: '67', length: '76', shoulder: '60', sleeve: '68' },
        { size: 'XXL', chest: '70', length: '78', shoulder: '62', sleeve: '70' },
    ],
};

export default function SizeGuidePage() {
    const { lang, t } = useLanguage();

    const renderTable = (data: typeof sizeData.tshirt, title: string) => (
        <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-vant-light mb-4">
                {title}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                    <thead>
                        <tr className="border-b border-vant-light/10">
                            <th className="text-left py-3 pr-4 font-heading text-xs uppercase tracking-wider text-vant-muted">
                                {t.product.size[lang]}
                            </th>
                            <th className="text-left py-3 pr-4 font-heading text-xs uppercase tracking-wider text-vant-muted">
                                {t.sizeGuide.chest[lang]}
                            </th>
                            <th className="text-left py-3 pr-4 font-heading text-xs uppercase tracking-wider text-vant-muted">
                                {t.sizeGuide.length[lang]}
                            </th>
                            <th className="text-left py-3 pr-4 font-heading text-xs uppercase tracking-wider text-vant-muted">
                                {t.sizeGuide.shoulder[lang]}
                            </th>
                            <th className="text-left py-3 font-heading text-xs uppercase tracking-wider text-vant-muted">
                                {t.sizeGuide.sleeve[lang]}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.size} className="border-b border-vant-light/5 hover:bg-vant-light/[0.02] transition-colors">
                                <td className="py-3 pr-4 font-heading text-sm text-vant-purple">{row.size}</td>
                                <td className="py-3 pr-4 text-vant-light/70">{row.chest}</td>
                                <td className="py-3 pr-4 text-vant-light/70">{row.length}</td>
                                <td className="py-3 pr-4 text-vant-light/70">{row.shoulder}</td>
                                <td className="py-3 text-vant-light/70">{row.sleeve}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center">
                        {t.sizeGuide.title[lang]}
                    </h1>
                    <p className="mt-4 text-sm text-vant-muted text-center max-w-md mx-auto">
                        {t.sizeGuide.subtitle[lang]}
                    </p>

                    <div className="mt-12 space-y-12">
                        {renderTable(sizeData.tshirt, 'T-Shirt')}
                        {renderTable(sizeData.hoodie, 'Hoodie')}
                    </div>

                    {/* Care instructions */}
                    <div className="mt-16">
                        <div className="divider mb-8" />
                        <h2 className="font-heading text-title font-bold uppercase tracking-tight">
                            {t.sizeGuide.care[lang]}
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {t.sizeGuide.careItems[lang].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-vant-light/70 font-body">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-vant-purple rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
