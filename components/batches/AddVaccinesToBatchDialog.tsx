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

interface AddVaccinesToBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchName: string;
  batchStartDate: string;
}

export default function AddVaccinesToBatchDialog({
  open,
  onOpenChange,
  batchId,
  batchName,
  batchStartDate,
}: AddVaccinesToBatchDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vaccineTemplates, setVaccineTemplates] = useState<VaccineTemplate[]>([]);
  const [selectedVaccineTemplateIds, setSelectedVaccineTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchVaccineTemplates();
      setSelectedVaccineTemplateIds([]);
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
      toast.error('Failed to load vaccine templates');
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

    if (selectedVaccineTemplateIds.length === 0) {
      toast.error('Please select at least one vaccine');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/batches/${batchId}/vaccines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaccineTemplateIds: selectedVaccineTemplateIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add vaccines');
      }

      toast.success(`${data.count} vaccination(s) scheduled successfully`);
      setSelectedVaccineTemplateIds([]);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vaccines');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vaccines to Batch</DialogTitle>
          <DialogDescription>
            Select vaccines to schedule for {batchName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {vaccineTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No vaccine templates available.</p>
              <p className="text-sm mt-2">Create vaccine templates in Settings first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Select Vaccines</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vaccineTemplates.map((template) => {
                  const batchAge = Math.floor(
                    (new Date().getTime() - new Date(batchStartDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const daysFromNow = template.ageInDays - batchAge;
                  const isPast = daysFromNow < 0;

                  return (
                    <div
                      key={template._id}
                      className={`flex items-start space-x-3 p-3 border rounded-lg ${
                        isPast ? 'opacity-50' : ''
                      }`}
                    >
                      <Checkbox
                        id={`vaccine-${template._id}`}
                        checked={selectedVaccineTemplateIds.includes(template._id)}
                        onCheckedChange={() => handleVaccineToggle(template._id)}
                        disabled={isPast}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`vaccine-${template._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {template.name}
                          {isPast && <span className="text-red-500 ml-2">(Already past due)</span>}
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Day {template.ageInDays} - ${template.defaultCost.toFixed(2)}
                          {!isPast && ` - ${daysFromNow === 0 ? 'Today' : `in ${daysFromNow} day${daysFromNow !== 1 ? 's' : ''}`}`}
                          {template.description && ` - ${template.description}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || vaccineTemplates.length === 0 || selectedVaccineTemplateIds.length === 0}
            >
              {isLoading ? 'Adding...' : 'Add Vaccines'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
