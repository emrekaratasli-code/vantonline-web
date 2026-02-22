'use client';

import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

export default function CartIcon() {
    const { cartCount } = useCart();

    return (
        <Link
            href="/cart"
            className="relative inline-flex items-center justify-center w-10 h-10 text-vant-light hover:text-vant-purple transition-colors duration-300"
            aria-label="Cart"
        >
            {/* Shopping bag SVG */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
            >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
            </svg>

            {/* Badge */}
            {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-heading font-bold bg-vant-purple text-white rounded-full leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                </span>
            )}
        </Link>
    );
}
