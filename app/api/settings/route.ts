import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Settings from '@/lib/models/Settings';
import { requireAuth } from '@/lib/auth/get-session';
import { PRODUCTS } from '@/lib/products';

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) {
    settings = await Settings.create({
      key: 'global',
      products: PRODUCTS,
    });
  }
  return settings;
}

export async function GET() {
  try {
    await connectDB();
    const settings = await getOrCreateSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { farmName, phone, deliveryFee, deliveryRegions, freeDeliveryThreshold, products } = body;

    await connectDB();

    const update: Record<string, unknown> = {};
    if (farmName !== undefined) update.farmName = farmName;
    if (phone !== undefined) update.phone = phone;
    if (deliveryFee !== undefined) update.deliveryFee = Number(deliveryFee);
    if (deliveryRegions !== undefined) update.deliveryRegions = deliveryRegions;
    if (freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = Number(freeDeliveryThreshold);
    if (products !== undefined) update.products = products;

    const settings = await Settings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: settings, message: 'Settings saved' });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
