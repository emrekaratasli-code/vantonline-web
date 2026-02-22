'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-vant-gray overflow-hidden">
                <Image
                    src={images[activeIndex] || '/images/placeholder-product.svg'}
                    alt={`${alt} - ${activeIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.svg'; }}
                />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`relative aspect-square bg-vant-gray overflow-hidden transition-opacity duration-300 ${activeIndex === i ? 'opacity-100 ring-1 ring-vant-purple' : 'opacity-50 hover:opacity-80'
                            }`}
                    >
                        <Image
                            src={img || '/images/placeholder-product.svg'}
                            alt={`${alt} thumbnail ${i + 1}`}
                            fill
                            sizes="(max-width: 768px) 33vw, 15vw"
                            className="object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-product.svg'; }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
