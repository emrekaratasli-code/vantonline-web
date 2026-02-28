'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import ProductCard from '@/components/ProductCard';
import FadeIn from '@/components/FadeIn';
import type { Product } from '@/data/products';

type CategoryFilter = 'all' | 'tshirt' | 'hoodie';
type SortOrder = 'default' | 'low-to-high' | 'high-to-low';

export default function DropPage() {
    return (
        <Suspense fallback={<div className="container-vant py-12 md:py-20 text-center text-vant-muted animate-pulse">Loading...</div>}>
            <DropContent />
        </Suspense>
    );
}

function DropContent() {
    const { lang, t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [sort, setSort] = useState<SortOrder>('default');
    const [searchText, setSearchText] = useState('');

    const queryFromUrl = searchParams.get('q') ?? '';

    useEffect(() => {
        setSearchText(queryFromUrl);
    }, [queryFromUrl]);

    // Fetch products from Supabase
    useEffect(() => {
        let cancelled = false;
        async function fetchProducts() {
            try {
                const { getAllProducts } = await import('@/lib/supabaseProducts');
                const data = await getAllProducts();
                if (!cancelled) {
                    setProducts(data);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        }
        fetchProducts();
        return () => { cancelled = true; };
    }, []);

    const filtered = useMemo(() => {
        const locale = lang === 'tr' ? 'tr' : 'en';
        const searchValue = searchText.trim().toLocaleLowerCase(locale);
        let result = [...products];

        if (searchValue) {
            result = result.filter((p) => {
                const haystack = [
                    p.name,
                    p.description?.[lang] ?? '',
                    p.slug,
                    p.color,
                    p.categorySlug,
                ].join(' ').toLocaleLowerCase(locale);
                return haystack.includes(searchValue);
            });
        }

        if (category !== 'all') {
            result = result.filter((p) => p.categorySlug === category);
        }
        if (sort === 'low-to-high') {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === 'high-to-low') {
            result.sort((a, b) => b.price - a.price);
        }
        return result;
    }, [products, searchText, category, sort, lang]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchText.trim();
        const next = new URLSearchParams(searchParams.toString());
        if (trimmed) {
            next.set('q', trimmed);
        } else {
            next.delete('q');
        }
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    };

    const categories: { value: CategoryFilter; label: string }[] = [
        { value: 'all', label: t.drop.all[lang] },
        { value: 'tshirt', label: t.drop.tshirt[lang] },
        { value: 'hoodie', label: t.drop.hoodie[lang] },
    ];

    return (
        <section className="container-vant py-12 md:py-20">
            {/* Header */}
            <FadeIn>
                <div className="text-center mb-12">
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.drop.title[lang]}
                    </h1>
                    <p className="mt-4 text-sm text-vant-muted max-w-md mx-auto">
                        {t.drop.subtitle[lang]}
                    </p>
                </div>
            </FadeIn>

            {/* Filters */}
            <FadeIn delay={0.1}>
                <div className="flex flex-col gap-4 mb-10 pb-6 border-b border-vant-light/5">
                    <form onSubmit={handleSearchSubmit} className="w-full flex flex-col sm:flex-row gap-2">
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder={lang === 'tr' ? 'Ürün ara...' : 'Search products...'}
                            className="input-vant w-full"
                            aria-label={lang === 'tr' ? 'Ürün ara' : 'Search products'}
                        />
                        <button type="submit" className="btn-secondary whitespace-nowrap !px-5 !py-3">
                            {lang === 'tr' ? 'Ara' : 'Search'}
                        </button>
                    </form>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Category tabs */}
                        <div className="flex items-center gap-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategory(cat.value)}
                                    className={`font-heading text-xs uppercase tracking-[0.15em] transition-colors duration-300 pb-1 border-b ${category === cat.value
                                        ? 'text-vant-light border-vant-purple'
                                        : 'text-vant-muted border-transparent hover:text-vant-light'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOrder)}
                            className="bg-transparent border border-vant-light/10 px-4 py-2 text-xs font-heading uppercase tracking-wider text-vant-muted focus:outline-none focus:border-vant-purple cursor-pointer"
                        >
                            <option value="default">{t.drop.noSort[lang]}</option>
                            <option value="low-to-high">{t.drop.lowToHigh[lang]}</option>
                            <option value="high-to-low">{t.drop.highToLow[lang]}</option>
                        </select>
                    </div>
                </div>
            </FadeIn>

            {/* Loading */}
            {loading && (
                <p className="text-center text-vant-muted font-body py-12 animate-pulse">
                    {t.product.loading[lang]}
                </p>
            )}

            {/* Product grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filtered.map((product, i) => (
                        <FadeIn key={product.id} delay={i * 0.05}>
                            <ProductCard product={product} />
                        </FadeIn>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <p className="text-center text-vant-muted mt-12 font-body">
                    {t.product.noProducts[lang]}
                </p>
            )}
        </section>
    );
}
