export interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    description: {
        tr: string;
        en: string;
    };
    category: 'tshirt' | 'hoodie';
    sizes: string[];
    color: string;
    images: string[];
    shopierUrl: string;
    isOutOfStock: boolean;
    careInstructions: {
        tr: string[];
        en: string[];
    };
}

export const products: Product[] = [
    {
        id: '1',
        slug: 'purple-slash-tee',
        name: 'Purple Slash Tee',
        price: 549,
        description: {
            tr: 'VANT imza koleksiyonunun amiral gemisi. %100 organik pamuk, oversize kesim. Göğüste minimal Purple Slash baskı. Sınırlı üretim — stok bitince tekrar üretim planlanmaz.',
            en: 'The flagship of the VANT signature collection. 100% organic cotton, oversized cut. Minimal Purple Slash print on chest. Limited production — once sold out, no restock planned.',
        },
        category: 'tshirt',
        sizes: ['S', 'M', 'L', 'XL'],
        color: 'Siyah',
        images: [
            '/images/products/purple-slash-tee-1.jpg',
            '/images/products/purple-slash-tee-2.jpg',
            '/images/products/purple-slash-tee-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/purple-slash-tee',
        isOutOfStock: false,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Düşük ısıda ütüleyin', 'Kurutma makinesine atmayın'],
            en: ['Wash at 30°C', 'Wash inside out', 'Iron on low heat', 'Do not tumble dry'],
        },
    },
    {
        id: '2',
        slug: 'void-oversized-hoodie',
        name: 'Void Oversized Hoodie',
        price: 899,
        description: {
            tr: 'Ağır gramajlı %100 pamuk hoodie. Oversize fit, kanguru cep, arkada büyük VANT baskı. Sokağın sessiz gücü. Sınırlı üretim.',
            en: 'Heavy-weight 100% cotton hoodie. Oversized fit, kangaroo pocket, large VANT print on back. The quiet power of the street. Limited production.',
        },
        category: 'hoodie',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        color: 'Siyah',
        images: [
            '/images/products/void-hoodie-1.jpg',
            '/images/products/void-hoodie-2.jpg',
            '/images/products/void-hoodie-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/void-oversized-hoodie',
        isOutOfStock: false,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Asarak kurutun', 'Baskı üzerine ütü yapmayın'],
            en: ['Wash at 30°C', 'Wash inside out', 'Hang dry', 'Do not iron on print'],
        },
    },
    {
        id: '3',
        slug: 'manifesto-tee',
        name: 'Manifesto Tee',
        price: 499,
        description: {
            tr: 'Arkada tam boy VANT manifestosu ile cesur bir statement parça. %100 pamuk, rahat kesim. Her giydiğinde bir duruş sergile.',
            en: 'A bold statement piece with full VANT manifesto on the back. 100% cotton, relaxed fit. Make a statement every time you wear it.',
        },
        category: 'tshirt',
        sizes: ['S', 'M', 'L', 'XL'],
        color: 'Beyaz',
        images: [
            '/images/products/manifesto-tee-1.jpg',
            '/images/products/manifesto-tee-2.jpg',
            '/images/products/manifesto-tee-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/manifesto-tee',
        isOutOfStock: false,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Düşük ısıda ütüleyin', 'Çamaşır suyu kullanmayın'],
            en: ['Wash at 30°C', 'Wash inside out', 'Iron on low heat', 'Do not bleach'],
        },
    },
    {
        id: '4',
        slug: 'nocturnal-hoodie',
        name: 'Nocturnal Hoodie',
        price: 949,
        description: {
            tr: 'Gece kültürüne adanmış premium hoodie. 400gsm ağır kumaş, çift katman kapüşon, minimal "NOCTURNAL" nakış. Stok bitince tekrar üretim planlanmaz.',
            en: 'Premium hoodie dedicated to night culture. 400gsm heavy fabric, double-layer hood, minimal "NOCTURNAL" embroidery. No restock planned once sold out.',
        },
        category: 'hoodie',
        sizes: ['M', 'L', 'XL'],
        color: 'Antrasit',
        images: [
            '/images/products/nocturnal-hoodie-1.jpg',
            '/images/products/nocturnal-hoodie-2.jpg',
            '/images/products/nocturnal-hoodie-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/nocturnal-hoodie',
        isOutOfStock: false,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Asarak kurutun', 'Kuru temizleme yapılabilir'],
            en: ['Wash at 30°C', 'Wash inside out', 'Hang dry', 'Dry cleaning possible'],
        },
    },
    {
        id: '5',
        slug: 'shadow-drop-tee',
        name: 'Shadow Drop Tee',
        price: 479,
        description: {
            tr: 'Minimal tasarım, maksimum etki. Ön yüzde küçük VANT logosu, arkada büyük "SHADOW" grafik. Dropped shoulder kesim. Sınırlı üretim.',
            en: 'Minimal design, maximum impact. Small VANT logo on front, large "SHADOW" graphic on back. Dropped shoulder cut. Limited production.',
        },
        category: 'tshirt',
        sizes: ['S', 'M', 'L', 'XL'],
        color: 'Siyah',
        images: [
            '/images/products/shadow-tee-1.jpg',
            '/images/products/shadow-tee-2.jpg',
            '/images/products/shadow-tee-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/shadow-drop-tee',
        isOutOfStock: true,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Düşük ısıda ütüleyin', 'Kurutma makinesine atmayın'],
            en: ['Wash at 30°C', 'Wash inside out', 'Iron on low heat', 'Do not tumble dry'],
        },
    },
    {
        id: '6',
        slug: 'urban-phantom-hoodie',
        name: 'Urban Phantom Hoodie',
        price: 879,
        description: {
            tr: 'Şehrin hayaletleri için tasarlandı. Reflektif VANT detayları, gizli fermuarlı cep, oversize fit. Geceye karış, fark edil.',
            en: 'Designed for the ghosts of the city. Reflective VANT details, hidden zip pocket, oversized fit. Blend into the night, get noticed.',
        },
        category: 'hoodie',
        sizes: ['S', 'M', 'L', 'XL'],
        color: 'Siyah',
        images: [
            '/images/products/phantom-hoodie-1.jpg',
            '/images/products/phantom-hoodie-2.jpg',
            '/images/products/phantom-hoodie-3.jpg',
        ],
        shopierUrl: 'https://shopier.com/vant/urban-phantom-hoodie',
        isOutOfStock: false,
        careInstructions: {
            tr: ['30°C\'de yıkayın', 'Ters çevirerek yıkayın', 'Asarak kurutun', 'Ağartıcı kullanmayın'],
            en: ['Wash at 30°C', 'Wash inside out', 'Hang dry', 'Do not use bleach'],
        },
    },
];

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product['category']): Product[] {
    return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
    return products.filter((p) => !p.isOutOfStock).slice(0, 4);
}

export function getAllSlugs(): string[] {
    return products.map((p) => p.slug);
}
