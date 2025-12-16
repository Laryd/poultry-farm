import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import FinancesClientWrapper from '@/components/finances/FinancesClientWrapper';

export default async function FinancesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track income, expenses, and analyze your farm's profitability
        </p>
      </div>

      <FinancesClientWrapper />
    </div>
  );
}
