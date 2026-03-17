import Client from 'shopify-buy';

/* ------------------------------------------------------------------ */
/*  Shopify Buy SDK — client singleton                                 */
/*  Uses Storefront API to create checkouts on Shopify                 */
/* ------------------------------------------------------------------ */

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'tzewyy-dj.myshopify.com';
const SHOPIFY_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '2ac934fdda2a7a4bcfae735eb7a271e3';

let clientInstance: Client | null = null;

export function getShopifyClient(): Client {
    if (clientInstance) return clientInstance;

    clientInstance = Client.buildClient({
        domain: SHOPIFY_DOMAIN,
        storefrontAccessToken: SHOPIFY_TOKEN,
        apiVersion: '2024-01',
    });

    return clientInstance;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ShopifyLineItem {
    variantId: string;
    quantity: number;
}

interface CartItemForShopify {
    name: string;
    quantity: number;
    size?: string;
    color?: string;
}

/* ------------------------------------------------------------------ */
/*  Fetch all Shopify products (for variant lookup)                     */
/* ------------------------------------------------------------------ */
export async function fetchShopifyProducts() {
    const client = getShopifyClient();
    const products = await client.product.fetchAll(250);
    return products;
}

/* ------------------------------------------------------------------ */
/*  Find Shopify variant by product name + size/color                  */
/* ------------------------------------------------------------------ */
export async function findVariantId(
    productName: string,
    size?: string,
    color?: string,
): Promise<string | null> {
    const client = getShopifyClient();
    const products = await client.product.fetchAll(250);

    // Find product by title (case-insensitive)
    const product = products.find(
        (p: { title: string }) => p.title.toLowerCase().trim() === productName.toLowerCase().trim(),
    );

    if (!product) return null;

    const variants = product.variants as any[];

    if (!variants || variants.length === 0) return null;

    // If there's only one variant, return it
    if (variants.length === 1) {
        return String(variants[0].id);
    }

    // Try to match by size and/or color
    for (const variant of variants) {
        const optionValues = (variant.selectedOptions || []).map(
            (opt: { value: string }) => opt.value.toLowerCase().trim(),
        );
        const sizeMatch = !size || size === 'Standart' || optionValues.includes(size.toLowerCase().trim());
        const colorMatch = !color || color === 'Standart' || optionValues.includes(color.toLowerCase().trim());

        if (sizeMatch && colorMatch) {
            return String(variant.id);
        }
    }

    // Fallback: try size-only match
    if (size && size !== 'Standart') {
        for (const variant of variants) {
            const optionValues = (variant.selectedOptions || []).map(
                (opt: { value: string }) => opt.value.toLowerCase().trim(),
            );
            if (optionValues.includes(size.toLowerCase().trim())) {
                return String(variant.id);
            }
        }
    }

    // Last resort: return first variant
    return String(variants[0].id);
}

/* ------------------------------------------------------------------ */
/*  Create a Shopify checkout from cart items                          */
/*  Returns the checkout URL for redirect                              */
/* ------------------------------------------------------------------ */
export async function createShopifyCheckout(
    cartItems: CartItemForShopify[],
): Promise<string | null> {
    try {
        const client = getShopifyClient();

        // Resolve variant IDs for each cart item
        const lineItems: ShopifyLineItem[] = [];
        for (const item of cartItems) {
            const variantId = await findVariantId(item.name, item.size, item.color);
            if (variantId) {
                lineItems.push({
                    variantId,
                    quantity: item.quantity,
                });
            } else {
                console.warn(`[shopify] Could not find variant for: ${item.name} (${item.size}, ${item.color})`);
            }
        }

        if (lineItems.length === 0) {
            console.error('[shopify] No valid line items for checkout');
            return null;
        }

        // Create checkout
        const checkout = await client.checkout.create({
            lineItems,
        });

        return (checkout as any).webUrl as string; // eslint-disable-line
    } catch (error) {
        console.error('[shopify] Checkout creation error:', error);
        return null;
    }
}
