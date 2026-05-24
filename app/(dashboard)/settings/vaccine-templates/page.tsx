import { Metadata } from 'next';
import Link from 'next/link';
import VaccineTemplateList from '@/components/settings/VaccineTemplateList';

export const metadata: Metadata = {
  title: 'Vaccine Templates | Poultry Farm',
  description: 'Manage vaccine templates for automatic scheduling',
};

export default function VaccineTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          <Link
            href="/settings/vaccine-templates"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
          >
            Vaccine Templates
          </Link>
          <Link
            href="/settings/shop"
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Shop & Company
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vaccine Templates</h1>
        <p className="text-gray-500 mt-2">
          Create and manage vaccine templates that can be automatically scheduled when creating batches
        </p>
      </div>

      <VaccineTemplateList />
    </div>
  );
}
