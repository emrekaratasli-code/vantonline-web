import { NextRequest, NextResponse } from 'next/server';
import { getIyzipay } from '@/lib/iyzico';
import { createServiceRoleClient } from '@/lib/supabase';
import { getCanonicalSiteUrl } from '@/lib/siteConfig';
import Iyzipay from 'iyzipay';

/* ------------------------------------------------------------------ */
/*  POST /api/payment/init                                             */
/*  Creates an iyzico Checkout Form for an existing order.             */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const { orderId, shipping, customerPhone } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            return NextResponse.json({ error: 'System error.' }, { status: 500 });
        }

        const { data: order, error: orderError } = await serviceClient
            .from('orders')
            .select('id, status, payment_method, total, shipping_address')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        if (order.payment_method !== 'credit_card') {
            return NextResponse.json({ error: 'Order payment method is not credit card.' }, { status: 400 });
        }

        if (order.status !== 'pending') {
            return NextResponse.json({ error: 'Order is not payable in current status.' }, { status: 409 });
        }

        const { data: orderItems, error: itemsError } = await serviceClient
            .from('order_items')
            .select('product_id, product_name, quantity, unit_price')
            .eq('order_id', orderId);

        if (itemsError || !orderItems || orderItems.length === 0) {
            return NextResponse.json({ error: 'Order items not found.' }, { status: 400 });
        }

        const calculatedTotal = orderItems.reduce(
            (sum, item) => sum + ((item.unit_price ?? 0) * (item.quantity ?? 0)),
            0,
        );

        const shippingAddress = (order.shipping_address as {
            firstName?: string;
            lastName?: string;
            address?: string;
            country?: string;
            city?: string;
            email?: string;
            phone?: string;
            shippingTotal?: number;
        } | null) ?? {};

        const shippingFee = Number(shippingAddress.shippingTotal ?? 0);
        const payableTotal = calculatedTotal + (Number.isFinite(shippingFee) ? shippingFee : 0);

        if (payableTotal <= 0 || payableTotal !== order.total) {
            return NextResponse.json({ error: 'Order total mismatch.' }, { status: 409 });
        }

        const buyerName = shippingAddress.firstName || shipping?.firstName || 'Ad';
        const buyerSurname = shippingAddress.lastName || shipping?.lastName || 'Soyad';
        const buyerAddress = shippingAddress.address || shipping?.address || 'Adres';
        const buyerCity = shippingAddress.city || shipping?.city || 'Istanbul';
        const buyerCountryRaw = shippingAddress.country || shipping?.country || 'TR';
        const buyerCountry = buyerCountryRaw === 'TR' ? 'Turkey' : buyerCountryRaw;
        const buyerPhone = shippingAddress.phone || customerPhone || '+905000000000';
        const buyerEmail = shippingAddress.email || shipping?.email || 'musteri@vantonline.com';

        const iyzipay = getIyzipay();

        const baseUrl = getCanonicalSiteUrl();

        const priceStr = (payableTotal / 100).toFixed(2);

        const basketItems = orderItems.map((item, index: number) => ({
            id: item.product_id || `item_${index}`,
            name: item.product_name || `Product ${index + 1}`,
            category1: 'Streetwear',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: (((item.unit_price ?? 0) * (item.quantity ?? 0)) / 100).toFixed(2),
        }));

        if (shippingFee > 0) {
            basketItems.push({
                id: 'shipping_fee',
                name: 'Shipping',
                category1: 'Shipping',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: (shippingFee / 100).toFixed(2),
            });
        }

        const buyer = {
            id: buyerPhone,
            name: buyerName,
            surname: buyerSurname,
            gsmNumber: buyerPhone,
            email: buyerEmail,
            identityNumber: '11111111111',
            registrationAddress: buyerAddress,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
            city: buyerCity,
            country: buyerCountry,
        };

        const address = {
            contactName: `${buyerName} ${buyerSurname}`,
            city: buyerCity,
            country: buyerCountry,
            address: buyerAddress,
        };

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: order.id,
            price: priceStr,
            paidPrice: priceStr,
            currency: Iyzipay.CURRENCY.TRY,
            basketId: `VANT-${order.id.substring(0, 8).toUpperCase()}`,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${baseUrl}/api/payment/callback`,
            buyer,
            shippingAddress: address,
            billingAddress: address,
            basketItems,
            enabledInstallments: [1, 2, 3, 6],
        };

        const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
            iyzipay.checkoutFormInitialize.create(request, (err: Error | null, response: Record<string, unknown>) => {
                if (err) reject(err);
                else resolve(response);
            });
        });

        if ((result as { status: string }).status !== 'success') {
            console.error('[payment/init] iyzico error:', result);
            return NextResponse.json(
                {
                    error: (result as { errorMessage?: string }).errorMessage || 'Could not initialize payment.',
                    details: result,
                },
                { status: 400 },
            );
        }

        const token = (result as { token?: string }).token;
        const { error: tokenSaveError } = await serviceClient
            .from('orders')
            .update({
                payment_token: token,
                status: 'pending',
            })
            .eq('id', order.id);

        if (tokenSaveError) {
            console.error('[payment/init] Could not persist payment token:', tokenSaveError.message);
            return NextResponse.json({ error: 'Could not prepare payment.' }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            checkoutFormContent: (result as { checkoutFormContent?: string }).checkoutFormContent,
            token,
            paymentPageUrl: (result as { paymentPageUrl?: string }).paymentPageUrl,
        });
    } catch (e) {
        console.error('[payment/init] Unexpected error:', e);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}
