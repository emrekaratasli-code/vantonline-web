'use client';

import { useState } from 'react';

interface SizeSelectorProps {
    sizes: string[];
    selectedSize: string;
    onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
                <button
                    key={size}
                    onClick={() => onSelect(size)}
                    className={`min-w-[44px] h-11 px-4 border text-xs font-heading uppercase tracking-wider transition-all duration-300 ${selectedSize === size
                            ? 'border-vant-purple text-vant-purple bg-vant-purple/5'
                            : 'border-vant-light/10 text-vant-muted hover:border-vant-light/30 hover:text-vant-light'
                        }`}
                >
                    {size}
                </button>
            ))}
        </div>
    );
}
