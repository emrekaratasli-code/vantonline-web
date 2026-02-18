declare global {
    interface Window {
        fbq: (...args: unknown[]) => void;
        _fbq: (...args: unknown[]) => void;
    }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const FB_PIXEL_ID = PIXEL_ID;

export const pageView = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

export const viewContent = (data: {
    content_name: string;
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'ViewContent', data);
    }
};

export const initiateCheckout = (data: {
    content_name: string;
    content_ids: string[];
    content_type: string;
    value: number;
    currency: string;
    num_items: number;
}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', data);
    }
};
