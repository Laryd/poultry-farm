'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface VaccineTemplate {
  _id: string;
  name: string;
  defaultCost: number;
  ageInDays: number;
  description?: string;
}

interface BatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BatchDialog({ open, onOpenChange }: BatchDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    currentSize: '',
    breed: '',
    startDate: '',
    totalCost: '',
  });
  const [vaccineTemplates, setVaccineTemplates] = useState<VaccineTemplate[]>([]);
  const [selectedVaccineTemplateIds, setSelectedVaccineTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchVaccineTemplates();
    }
  }, [open]);

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
          ...formData,
          currentSize: parseInt(formData.currentSize),
          totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
          vaccineTemplateIds: selectedVaccineTemplateIds.length > 0 ? selectedVaccineTemplateIds : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch');
      }

      toast.success('Batch created successfully');
      setFormData({ name: '', currentSize: '', breed: '', startDate: '', totalCost: '' });
      setSelectedVaccineTemplateIds([]);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>Add a new batch of birds to your farm</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Batch Name</Label>
            <Input
              id="name"
              placeholder="e.g., Batch A-2024"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSize">Number of Birds</Label>
            <Input
              id="currentSize"
              type="number"
              min="1"
              placeholder="e.g., 100"
              value={formData.currentSize}
              onChange={(e) => setFormData({ ...formData, currentSize: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input
              id="breed"
              placeholder="e.g., Improved Kienyeji"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
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
            <div className="space-y-2 border-t pt-3">
              <div>
                <Label>Vaccine Schedule (Optional)</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select vaccines to automatically schedule
                </p>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {vaccineTemplates.map((template) => (
                  <div key={template._id} className="flex items-start space-x-2 p-2 border rounded">
                    <Checkbox
                      id={`vaccine-${template._id}`}
                      checked={selectedVaccineTemplateIds.includes(template._id)}
                      onCheckedChange={() => handleVaccineToggle(template._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`vaccine-${template._id}`}
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {template.name}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Day {template.ageInDays} - ${template.defaultCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Batch'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
