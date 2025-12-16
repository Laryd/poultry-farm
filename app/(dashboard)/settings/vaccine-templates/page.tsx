import { Metadata } from 'next';
import VaccineTemplateList from '@/components/settings/VaccineTemplateList';

export const metadata: Metadata = {
  title: 'Vaccine Templates | Poultry Farm',
  description: 'Manage vaccine templates for automatic scheduling',
};

export default function VaccineTemplatesPage() {
  return (
    <div className="space-y-6">
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
