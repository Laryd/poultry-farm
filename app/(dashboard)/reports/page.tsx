import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import ReportsClient from '@/components/reports/ReportsClient';

export const metadata = { title: 'Reports' };

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Download comprehensive Excel reports for every area of your farm
        </p>
      </div>
      <ReportsClient />
    </div>
  );
}
