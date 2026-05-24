import { CheckoutClient } from '@/components/shop/CheckoutClient';
import connectDB from '@/lib/db/mongodb';
import Settings from '@/lib/models/Settings';

async function getDeliveryFee(): Promise<number> {
  try {
    await connectDB();
    const settings = await Settings.findOne({ key: 'global' }).select('deliveryFee').lean();
    return (settings as { deliveryFee?: number } | null)?.deliveryFee ?? 300;
  } catch {
    return 300;
  }
}

export async function generateMetadata() {
  try {
    await connectDB();
    const s = await Settings.findOne({ key: 'global' }).select('farmName').lean();
    const name = (s as { farmName?: string } | null)?.farmName ?? 'FreshFarm Poultry';
    return { title: `Checkout | ${name}` };
  } catch {
    return { title: 'Checkout | FreshFarm Poultry' };
  }
}

export default async function CheckoutPage() {
  const deliveryFee = await getDeliveryFee();
  return <CheckoutClient deliveryFee={deliveryFee} />;
}
