import { products } from '@/data/products';
import ProductDetailContent from './ProductDetailContent';

export function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export default function ProductPage() {
    return <ProductDetailContent />;
}
