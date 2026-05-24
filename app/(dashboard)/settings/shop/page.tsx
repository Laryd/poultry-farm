import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import ShopSettingsClient from '@/components/settings/ShopSettingsClient';
import Link from 'next/link';

export const metadata = { title: 'Shop Settings' };

export default async function ShopSettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          <Link
            href="/settings/vaccine-templates"
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Vaccine Templates
          </Link>
          <Link
            href="/settings/shop"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
          >
            Shop & Company
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your farm name, products, pricing, and delivery options.
        </p>
      </div>

      <ShopSettingsClient />
    </div>
  );
}
