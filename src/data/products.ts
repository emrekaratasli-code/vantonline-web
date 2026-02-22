/* ------------------------------------------------------------------ */
/*  Product types — single source of truth                            */
/*  Static product array removed; data now comes from Supabase.       */
/* ------------------------------------------------------------------ */

export interface Product {
    id: string;
    slug: string;
    name: string;
    /** Price in kuruş (1 TRY = 100 kuruş) for safe integer math */
    price: number;
    currency: string;
    description: {
        tr: string;
        en: string;
    };
    categorySlug: string;
    sizes: string[];
    color: string;
    images: string[];
    isOutOfStock: boolean;
    isFeatured: boolean;
    careInstructions: {
        tr: string[];
        en: string[];
    };
}

export interface CartItem {
    /** Unique key: `${productId}::${size}::${color}` */
    id: string;
    productId: string;
    slug: string;
    name: string;
    /** Price in kuruş */
    price: number;
    currency: string;
    size: string;
    color?: string;
    quantity: number;
    image: string;
}
