'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package2, DollarSign, Settings, ShoppingBag, FileBarChart, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/batches', label: 'Batches', icon: Package2 },
  { href: '/finances', label: 'Finances', icon: DollarSign },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings/vaccine-templates', label: 'Settings', icon: Settings },
];

export function Navigation({ farmName = 'FreshFarm' }: { farmName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden transition-transform duration-300',
          'bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-700',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐔</span>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {farmName}
            </span>
          </div>
          <button
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
