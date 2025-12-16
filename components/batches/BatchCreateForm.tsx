'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface VaccineTemplate {
  _id: string;
  name: string;
  defaultCost: number;
  ageInDays: number;
  description?: string;
}

export default function BatchCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    currentSize: '',
    category: 'chick' as 'chick' | 'adult',
    startDate: new Date().toISOString().split('T')[0],
    totalCost: '',
  });
  const [vaccineTemplates, setVaccineTemplates] = useState<VaccineTemplate[]>([]);
  const [selectedVaccineTemplateIds, setSelectedVaccineTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    fetchVaccineTemplates();
  }, []);

  const fetchVaccineTemplates = async () => {
    try {
      const response = await fetch('/api/vaccine-templates');
      const result = await response.json();
      if (result.success) {
        setVaccineTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch vaccine templates:', error);
    }
  };

  const handleVaccineToggle = (templateId: string) => {
    setSelectedVaccineTemplateIds(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          breed: formData.breed,
          currentSize: parseInt(formData.currentSize),
          category: formData.category,
          startDate: formData.startDate,
          totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
          vaccineTemplateIds: selectedVaccineTemplateIds.length > 0 ? selectedVaccineTemplateIds : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch');
      }

      toast.success('Batch created successfully');
      router.push(`/batches/${data.data._id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Batch Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          placeholder="e.g., Batch A-2024"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="breed">Breed <span className="text-red-500">*</span></Label>
        <Input
          id="breed"
          placeholder="e.g., Improved Kienyeji"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
        <Select
          value={formData.category}
          onValueChange={(value: 'chick' | 'adult') => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chick">Chick (Day-Old to Young)</SelectItem>
            <SelectItem value="adult">Adult (Mature/Layers)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select whether this batch is chicks or adults
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentSize">Initial Size <span className="text-red-500">*</span></Label>
        <Input
          id="currentSize"
          type="number"
          min="1"
          placeholder="Number of birds"
          value={formData.currentSize}
          onChange={(e) => setFormData({ ...formData, currentSize: e.target.value })}
          required
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Number of birds in this batch
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalCost">Total Cost (Optional)</Label>
        <Input
          id="totalCost"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 15000"
          value={formData.totalCost}
          onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total cost to purchase this batch. A transaction will be created automatically.
        </p>
      </div>

      {vaccineTemplates.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <div>
            <Label>Vaccine Schedule (Optional)</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select vaccines to automatically schedule for this batch
            </p>
          </div>
          <div className="space-y-2">
            {vaccineTemplates.map((template) => (
              <div key={template._id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={`vaccine-${template._id}`}
                  checked={selectedVaccineTemplateIds.includes(template._id)}
                  onCheckedChange={() => handleVaccineToggle(template._id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`vaccine-${template._id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {template.name}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Day {template.ageInDays} - ${template.defaultCost.toFixed(2)}
                    {template.description && ` - ${template.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Batch'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/batches')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
