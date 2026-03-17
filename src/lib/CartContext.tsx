'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from 'react';
import type { CartItem, Product } from '@/data/products';

/* ------------------------------------------------------------------ */
/*  Context type                                                       */
/* ------------------------------------------------------------------ */
interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    /** Total in kuruş */
    cartTotal: number;
    addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
});

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = 'vant_cart';

function loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        /* quota exceeded — silently ignore */
    }
}

/* ------------------------------------------------------------------ */
/*  Unique cart key                                                    */
/* ------------------------------------------------------------------ */
function cartItemId(productId: string, size: string, color: string): string {
    return `${productId}::${size}::${color}`;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function CartProvider({ children }: { children: ReactNode }) {
    // Initialise empty to avoid hydration mismatch; load from storage in useEffect.
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load cart from localStorage AFTER mount (avoids SSR hydration mismatch).
    useEffect(() => {
        setItems(loadCart());
        setHydrated(true);
    }, []);

    // Persist whenever items change (skip the initial SSR-empty render).
    useEffect(() => {
        if (hydrated) saveCart(items);
    }, [items, hydrated]);

    /* ---- actions ---- */

    const addToCart = useCallback(
        (product: Product, size: string, color: string, quantity = 1) => {
            setItems((prev) => {
                const id = cartItemId(product.id, size, color);
                const existing = prev.find((i) => i.id === id);
                if (existing) {
                    return prev.map((i) =>
                        i.id === id ? { ...i, quantity: i.quantity + quantity } : i,
                    );
                }
                const newItem: CartItem = {
                    id,
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    currency: product.currency,
                    size,
                    color,
                    quantity,
                    image: product.images[0] ?? '',
                    stockQuantity: product.stockQuantity,
                };
                return [...prev, newItem];
            });
        },
        [],
    );

    const removeFromCart = useCallback((itemId: string) => {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    /* ---- derived ---- */

    const cartCount = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items],
    );

    const cartTotal = useMemo(
        () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [items],
    );

    const value = useMemo<CartContextType>(
        () => ({
            cartItems: items,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }),
        [items, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    return useContext(CartContext);
}
