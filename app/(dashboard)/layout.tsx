import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import connectDB from '@/lib/db/mongodb';
import Settings from '@/lib/models/Settings';

async function getFarmName(): Promise<string> {
  try {
    await connectDB();
    const s = await Settings.findOne({ key: 'global' }).select('farmName').lean();
    return (s as { farmName?: string } | null)?.farmName ?? 'FreshFarm';
  } catch {
    return 'FreshFarm';
  }
}

async function signOutAction() {
  'use server';
  const { signOut } = await import('@/lib/auth/auth');
  await signOut();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const farmName = await getFarmName();

  return (
    <div className="min-h-screen dashboard-gradient-bg">
      <header className="sticky top-0 z-50 glass-header">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 group"
              >
                <span className="text-2xl transition-transform group-hover:scale-110">🐔</span>
                <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block">
                  {farmName}
                </span>
              </Link>
              <Navigation farmName={farmName} />
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-9 w-9 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-800/40 dark:hover:to-orange-800/40 border border-amber-200/50 dark:border-amber-700/30"
                  >
                    <User className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card rounded-xl border-white/50 dark:border-white/10">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <form action={signOutAction}>
                    <button type="submit" className="w-full">
                      <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
