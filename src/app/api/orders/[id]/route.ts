import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireApiKey } from '@/lib/apiAuth';

/* ------------------------------------------------------------------ */
/*  GET /api/orders/[id]                                               */
/*  Returns order details by order ID.                                 */
/* ------------------------------------------------------------------ */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } },
) {
    const authError = requireApiKey(req);
    if (authError) return authError;

    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
        }

        const serviceClient = createServiceRoleClient();
        if (!serviceClient) {
            return NextResponse.json({ error: 'System error.' }, { status: 500 });
        }

        const { data: order, error: orderError } = await serviceClient
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const { data: items } = await serviceClient
            .from('order_items')
            .select('*')
            .eq('order_id', id);

        return NextResponse.json({
            ok: true,
            order: {
                ...order,
                items: items ?? [],
                orderNumber: `VANT-${order.id.substring(0, 8).toUpperCase()}`,
            },
        });
    } catch (e) {
        console.error('[orders/[id]] Unexpected error:', e);
        return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
}