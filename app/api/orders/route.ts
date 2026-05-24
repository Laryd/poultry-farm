import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import { auth } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryType,
      items,
      notes,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; pricePerUnit: number }) =>
        sum + item.quantity * item.pricePerUnit,
      0
    );
    const deliveryFee = deliveryType === 'delivery' ? 300 : 0;
    const totalAmount = subtotal + deliveryFee;

    const orderItems = items.map(
      (item: {
        productId: string;
        productName: string;
        variant?: string;
        quantity: number;
        unit: string;
        pricePerUnit: number;
      }) => ({
        ...item,
        totalPrice: item.quantity * item.pricePerUnit,
      })
    );

    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryType: deliveryType || 'delivery',
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      notes,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
