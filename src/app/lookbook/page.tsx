import type { Metadata } from 'next';
import LookbookClient from './LookbookClient';

export const metadata: Metadata = {
    title: 'Lookbook | VANT',
    description: 'VANT Lookbook — Purple Slash koleksiyonunun editöryal vitrini.',
};

export default function LookbookPage() {
    return <LookbookClient />;
}
