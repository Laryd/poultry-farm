import { ShopClient } from '@/components/shop/ShopClient';
import connectDB from '@/lib/db/mongodb';
import Settings from '@/lib/models/Settings';
import { PRODUCTS } from '@/lib/products';

async function getSettings() {
  try {
    await connectDB();
    const settings = await Settings.findOne({ key: 'global' }).lean();
    if (!settings) return null;
    return settings;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const settings = await getSettings();
  const name = (settings as { farmName?: string } | null)?.farmName ?? 'FreshFarm Poultry';
  return {
    title: `Order Fresh Farm Products | ${name}`,
    description: `Order fresh farm chickens, eggs and day-old chicks directly from ${name}.`,
  };
}

export default async function ShopPage() {
  const settings = await getSettings();
  const s = settings as {
    farmName?: string;
    phone?: string;
    deliveryFee?: number;
    deliveryRegions?: string;
    freeDeliveryThreshold?: number;
    products?: typeof PRODUCTS;
  } | null;

  const shopSettings = {
    farmName: s?.farmName ?? 'FreshFarm Poultry',
    phone: s?.phone ?? '+254 700 000 000',
    deliveryFee: s?.deliveryFee ?? 300,
    deliveryRegions: s?.deliveryRegions ?? 'Nairobi & environs',
    freeDeliveryThreshold: s?.freeDeliveryThreshold ?? 5000,
    products: (s?.products && s.products.length > 0) ? s.products : PRODUCTS,
  };

  return <ShopClient settings={shopSettings} />;
}
