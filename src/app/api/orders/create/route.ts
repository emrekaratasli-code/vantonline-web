import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { buildInternationalShippingOption } from '@/lib/internationalShipping';

type PaymentMethod = 'bank_transfer' | 'credit_card';

type CreateOrderItemInput = {
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
};

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/* ------------------------------------------------------------------ */
/*  POST /api/orders/create                                            */
/*  Creates an order in Supabase from cart + shipping data.            */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
    try {
        const { shipping, cartItems, customerPhone, paymentMethod, shippingRate, shippingTotal, grandTotal } = await req.json();

        const resolvedPaymentMethod: PaymentMethod =
            paymentMethod === 'bank_transfer' || paymentMethod === 'credit_card'
                ? paymentMethod
                : 'credit_card';

        if (!shipping || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 });
        }

        const normalizedCustomerPhone =
            typeof customerPhone === 'string' && customerPhone.trim().length > 0
                ? customerPhone.trim()
                : null;

        if (normalizedCustomerPhone && !E164_REGEX.test(normalizedCustomerPhone)) {
            return NextResponse.json({ error: 'Phone must be in E.164 format.' }, { status: 400 });
        }

        if (!shipping.firstName || !shipping.lastName || !shipping.address || !shipping.city) {
            return NextResponse.json({ error: 'Missing shipping fields.' }, { status: 400 });
        }

        if (!shippingRate || !shippingRate.carrierId) {
            return NextResponse.json({ error: 'Shipping rate is required.' }, { status: 400 });
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
            return NextResponse.json({ 
                ok: false, 
                error: `System error: Supabase client init failed (URL: ${hasUrl}, Key: ${hasKey})` 
            }, { status: 500 });
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

        let shippingFee = 0;
        let resolvedShippingRate: {
            carrierId: string;
            carrierName: string;
            price: number;
            estimatedDays: string | null;
            city: string;
            country?: string;
        } | null = null;

        const fallbackCities = ['Diger', 'Diğer'];
        const requestedCarrierId = String(shippingRate.carrierId);
        const countryCode = String(shipping.country || 'TR').toUpperCase();

        if (countryCode !== 'TR') {
            const internationalRate = buildInternationalShippingOption(countryCode, shipping.city);
            if (!internationalRate) {
                return NextResponse.json({ error: 'Shipping is not available for this country yet.' }, { status: 409 });
            }
            if (requestedCarrierId !== internationalRate.carrierId) {
                return NextResponse.json({ error: 'Shipping carrier mismatch.' }, { status: 409 });
            }

            shippingFee = Number(internationalRate.price || 0);
            resolvedShippingRate = {
                carrierId: internationalRate.carrierId,
                carrierName: internationalRate.carrierName,
                price: shippingFee,
                estimatedDays: internationalRate.estimatedDays || null,
                city: internationalRate.city,
                country: countryCode,
            };
        } else {
            const { data: rateRows, error: rateError } = await serviceClient
                .from('shipping_rates')
                .select('price, city, estimated_days, carrier:shipping_carriers!carrier_id(id, name, is_active)')
                .eq('is_active', true)
                .eq('carrier_id', requestedCarrierId)
                .in('city', [shipping.city, ...fallbackCities]);

            if (rateError || !rateRows || rateRows.length === 0) {
                return NextResponse.json({ error: 'Shipping rate not found.' }, { status: 409 });
            }

            const exactRate = rateRows.find((row: any) => row.city === shipping.city);
            const fallbackRate = rateRows.find((row: any) => fallbackCities.includes(row.city));
            const chosenRate = exactRate || fallbackRate;
            const chosenCarrier = Array.isArray(chosenRate?.carrier)
                ? chosenRate.carrier[0]
                : chosenRate?.carrier;

            if (!chosenRate || !chosenCarrier || chosenCarrier.is_active === false) {
                return NextResponse.json({ error: 'Selected carrier is not available.' }, { status: 409 });
            }

            shippingFee = Number(chosenRate.price || 0);
            resolvedShippingRate = {
                carrierId: String(chosenCarrier.id),
                carrierName: chosenCarrier.name,
                price: shippingFee,
                estimatedDays: chosenRate.estimated_days || null,
                city: chosenRate.city,
                country: countryCode,
            };
        }

        const expectedGrandTotal = calculatedTotal + shippingFee;
        if (Number.isFinite(Number(shippingTotal)) && Number(shippingTotal) !== shippingFee) {
            return NextResponse.json({ error: 'Shipping total mismatch.' }, { status: 409 });
        }
        if (Number.isFinite(Number(grandTotal)) && Number(grandTotal) !== expectedGrandTotal) {
            return NextResponse.json({ error: 'Grand total mismatch.' }, { status: 409 });
        }

        const normalizedEmail = shipping.email?.toLowerCase().trim();
        let customerId = null;

        if (normalizedEmail) {
            // First try to find existing customer by email
            const { data: existingCustomer, error: existingCustomerError } = await serviceClient
                .from('customers')
                .select('id')
                .eq('email', normalizedEmail)
                .maybeSingle();

            if (existingCustomerError) {
                console.error('[orders/create] Customer lookup error:', {
                    message: existingCustomerError.message,
                    code: (existingCustomerError as any).code,
                    details: (existingCustomerError as any).details,
                    hint: (existingCustomerError as any).hint,
                });
                return NextResponse.json({ error: 'Could not verify customer.' }, { status: 500 });
            }

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                // If not found, create one
                const { data: newCustomer, error: createError } = await serviceClient
                    .from('customers')
                    .insert({
                        email: normalizedEmail,
                        phone: normalizedCustomerPhone,
                        first_name: shipping.firstName,
                        last_name: shipping.lastName,
                    })
                    .select('id')
                    .single();

                if (!createError && newCustomer) {
                    customerId = newCustomer.id;
                } else if (createError && normalizedCustomerPhone) {
                    // Recover from a unique-phone clash by reusing the existing customer.
                    const { data: customerByPhone } = await serviceClient
                        .from('customers')
                        .select('id')
                        .eq('phone', normalizedCustomerPhone)
                        .maybeSingle();
                    if (customerByPhone) {
                        customerId = customerByPhone.id;
                    }
                }

                if (!customerId) {
                    console.error('[orders/create] Customer create error:', {
                        message: createError?.message,
                        code: (createError as any)?.code,
                        details: (createError as any)?.details,
                        hint: (createError as any)?.hint,
                    });
                    return NextResponse.json({ error: 'Could not prepare customer record.' }, { status: 500 });
                }
            }
        }

        if (!customerId) {
            return NextResponse.json({ error: 'Customer record is required.' }, { status: 409 });
        }

        const shippingAddress = {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            email: shipping.email || null,
            phone: normalizedCustomerPhone,
            address: shipping.address,
            country: shipping.country || 'TR',
            city: shipping.city,
            district: shipping.district || null,
            postalCode: shipping.postalCode || null,
            shippingRate: resolvedShippingRate,
            shippingTotal: shippingFee,
            itemsTotal: calculatedTotal,
            grandTotal: calculatedTotal + shippingFee,
        };

        const { data: order, error: orderError } = await serviceClient
            .from('orders')
            .insert({
                customer_id: customerId,
                status: 'pending',
                shipping_address: shippingAddress,
                payment_method: resolvedPaymentMethod,
                total: calculatedTotal + shippingFee,
                currency: 'TRY',
            })
            .select('id')
            .single();

        if (orderError || !order) {
            console.error('[orders/create] Order insert error:', {
                message: orderError?.message,
                code: (orderError as any)?.code,
                details: (orderError as any)?.details,
                hint: (orderError as any)?.hint,
            });
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
    } catch (e: any) {
        const msg = e?.message || String(e);
        console.error('[orders/create] Unexpected error:', msg, e);
        return NextResponse.json({ ok: false, error: `Server error: ${msg}` }, { status: 500 });
    }
}

