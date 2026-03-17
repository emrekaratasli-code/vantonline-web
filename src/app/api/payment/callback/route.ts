import { NextRequest, NextResponse } from 'next/server';
import { getIyzipay } from '@/lib/iyzico';
import { createServiceRoleClient } from '@/lib/supabase';
import Iyzipay from 'iyzipay';

/* ------------------------------------------------------------------ */
/*  POST /api/payment/callback                                         */
/*  iyzico redirects here after the user completes payment             */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const token = formData.get('token') as string;

        if (!token) {
            return NextResponse.redirect(new URL('/checkout?error=missing_token', req.url));
        }

        const iyzipay = getIyzipay();

        const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
            iyzipay.checkoutForm.retrieve(
                {
                    locale: Iyzipay.LOCALE.TR,
                    token,
                },
                (err: Error | null, response: Record<string, unknown>) => {
                    if (err) reject(err);
                    else resolve(response);
                },
            );
        });

        const paymentStatus = (result as { paymentStatus?: string }).paymentStatus;
        const status = (result as { status?: string }).status;
        const conversationId = (result as { conversationId?: string }).conversationId;

        if (!conversationId) {
            return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
        }

        const orderId = conversationId;
        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            console.error('[payment/callback] Service client unavailable');
            return NextResponse.redirect(new URL('/checkout?error=system', req.url));
        }

        const { data: order, error: orderError } = await serviceClient
            .from('orders')
            .select('id, status, payment_token')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
        }

        if (!order.payment_token || order.payment_token !== token) {
            console.error('[payment/callback] Token mismatch for order:', orderId);
            return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
        }

        if (status === 'success' && paymentStatus === 'SUCCESS') {
            const { error: paidUpdateError } = await serviceClient
                .from('orders')
                .update({
                    status: 'paid',
                    payment_id: (result as { paymentId?: string }).paymentId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', orderId)
                .eq('status', 'pending');

            if (paidUpdateError) {
                console.error('[payment/callback] Order status update failed:', paidUpdateError.message);
                return NextResponse.redirect(new URL('/checkout?error=system', req.url));
            }

            try {
                const { data: orderItems, error: orderItemsError } = await serviceClient
                    .from('order_items')
                    .select('product_id, quantity')
                    .eq('order_id', orderId);

                if (orderItemsError) {
                    throw orderItemsError;
                }

                const qtyByProduct = new Map<string, number>();
                for (const item of orderItems ?? []) {
                    if (!item.product_id) continue;
                    qtyByProduct.set(item.product_id, (qtyByProduct.get(item.product_id) ?? 0) + (item.quantity ?? 0));
                }

                for (const [productId, qty] of Array.from(qtyByProduct.entries())) {
                    const { data: stockOk, error: stockError } = await serviceClient.rpc('decrement_product_stock', {
                        p_product_id: productId,
                        p_quantity: qty,
                    });

                    if (stockError || !stockOk) {
                        console.error('[payment/callback] Stock deduction failed:', stockError?.message);
                        await serviceClient
                            .from('orders')
                            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                            .eq('id', orderId);
                        return NextResponse.redirect(new URL('/checkout?error=stock', req.url));
                    }
                }
            } catch (err) {
                console.error('[payment/callback] Stock deduction error:', err);
                await serviceClient
                    .from('orders')
                    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                    .eq('id', orderId);
                return NextResponse.redirect(new URL('/checkout?error=stock', req.url));
            }

            const orderNumber = `VANT-${orderId.substring(0, 8).toUpperCase()}`;
            return NextResponse.redirect(
                new URL(`/order-success?order=${encodeURIComponent(orderNumber)}`, req.url),
            );
        }

        console.error('[payment/callback] Payment failed:', result);
        await serviceClient
            .from('orders')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url));
    } catch (e) {
        console.error('[payment/callback] Unexpected error:', e);
        return NextResponse.redirect(new URL('/checkout?error=system', req.url));
    }
}