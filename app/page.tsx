import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="text-6xl mb-6">🐔</div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Poultry Farm Management
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Manage your poultry farm with ease. Track batches, monitor egg production,
          record vaccinations, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
