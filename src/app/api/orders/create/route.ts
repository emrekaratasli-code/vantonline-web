import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

type PaymentMethod = 'bank_transfer' | 'credit_card';

type CreateOrderItemInput = {
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
};

/* ------------------------------------------------------------------ */
/*  POST /api/orders/create                                            */
/*  Creates an order in Supabase from cart + shipping data.            */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const { shipping, cartItems, customerPhone, paymentMethod } = await req.json();

        const resolvedPaymentMethod: PaymentMethod =
            paymentMethod === 'bank_transfer' || paymentMethod === 'credit_card'
                ? paymentMethod
                : 'credit_card';

        if (!shipping || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 });
        }

        if (!customerPhone) {
            return NextResponse.json({ error: 'Customer phone is required.' }, { status: 400 });
        }

        if (!shipping.firstName || !shipping.lastName || !shipping.address || !shipping.city) {
            return NextResponse.json({ error: 'Missing shipping fields.' }, { status: 400 });
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            return NextResponse.json({ error: 'System error.' }, { status: 500 });
        }

        const uniqueProductIds = new Set(
            (cartItems as CreateOrderItemInput[])
                .map((item) => item.productId)
                .filter((id): id is string => Boolean(id)),
        );
        const productIds = Array.from(uniqueProductIds);

        if (productIds.length === 0) {
            return NextResponse.json({ error: 'No valid product in cart.' }, { status: 400 });
        }

        const { data: productRows, error: productError } = await serviceClient
            .from('products')
            .select('id, name, price, stock_quantity, is_out_of_stock')
            .in('id', productIds);

        if (productError || !productRows) {
            return NextResponse.json({ error: 'Could not load products.' }, { status: 500 });
        }

        const productMap = new Map(
            productRows.map((row: {
                id: string;
                name: string;
                price: number;
                stock_quantity: number | null;
                is_out_of_stock: boolean | null;
            }) => [row.id, row]),
        );

        const qtyByProduct = new Map<string, number>();
        const normalizedItems = (cartItems as CreateOrderItemInput[]).map((item) => {
            const dbProduct = productMap.get(item.productId);
            if (!dbProduct) {
                throw new Error('Invalid product in cart.');
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error('Invalid quantity.');
            }

            const nextQty = (qtyByProduct.get(item.productId) ?? 0) + item.quantity;
            qtyByProduct.set(item.productId, nextQty);

            return {
                product_id: item.productId,
                product_name: dbProduct.name,
                size: item.size || 'Standart',
                color: item.color || null,
                quantity: item.quantity,
                unit_price: dbProduct.price,
            };
        });

        for (const [productId, qty] of Array.from(qtyByProduct.entries())) {
            const dbProduct = productMap.get(productId);
            if (!dbProduct) continue;
            const stock = dbProduct.stock_quantity ?? 0;
            if (dbProduct.is_out_of_stock || stock < qty) {
                return NextResponse.json(
                    { error: `Insufficient stock for '${dbProduct.name}'.` },
                    { status: 409 },
                );
            }
        }

        const calculatedTotal = normalizedItems.reduce(
            (sum, item) => sum + (item.unit_price * item.quantity),
            0,
        );

        const { data: customer } = await serviceClient
            .from('customers')
            .select('id')
            .eq('phone', customerPhone)
            .maybeSingle();

        const shippingAddress = {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            email: shipping.email || null,
            phone: customerPhone,
            address: shipping.address,
            city: shipping.city,
            district: shipping.district || null,
            postalCode: shipping.postalCode || null,
        };

        const { data: order, error: orderError } = await serviceClient
            .from('orders')
            .insert({
                customer_id: customer?.id || null,
                status: 'pending',
                shipping_address: shippingAddress,
                payment_method: resolvedPaymentMethod,
                total: calculatedTotal,
                currency: 'TRY',
            })
            .select('id')
            .single();

        if (orderError || !order) {
            console.error('[orders/create] Order insert error:', orderError?.message);
            return NextResponse.json({ error: 'Could not create order.' }, { status: 500 });
        }

        const { error: itemsError } = await serviceClient
            .from('order_items')
            .insert(normalizedItems.map((item) => ({ ...item, order_id: order.id })));

        if (itemsError) {
            console.error('[orders/create] Order items insert error:', itemsError.message);
            await serviceClient.from('orders').delete().eq('id', order.id);
            return NextResponse.json({ error: 'Could not save order items.' }, { status: 500 });
        }

        if (resolvedPaymentMethod !== 'credit_card') {
            try {
                for (const [productId, qty] of Array.from(qtyByProduct.entries())) {
                    const { data: stockOk, error: stockError } = await serviceClient.rpc('decrement_product_stock', {
                        p_product_id: productId,
                        p_quantity: qty,
                    });

                    if (stockError || !stockOk) {
                        await serviceClient.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                        return NextResponse.json({ error: 'Stock allocation failed.' }, { status: 409 });
                    }
                }
            } catch (rpcErr) {
                console.error('[orders/create] Stock deduction error:', rpcErr);
                await serviceClient.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                return NextResponse.json({ error: 'Stock operation failed.' }, { status: 500 });
            }
        }

        const orderNumber = `VANT-${order.id.substring(0, 8).toUpperCase()}`;

        return NextResponse.json({
            ok: true,
            orderId: order.id,
            orderNumber,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[orders/create] Unexpected error:', msg, e);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}