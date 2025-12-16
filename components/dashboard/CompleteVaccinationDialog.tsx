'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/date';

interface Vaccination {
  _id: string;
  vaccineName: string;
  scheduledDate: string;
  batchId: {
    name: string;
  };
}

interface CompleteVaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination: Vaccination | null;
  onSuccess: () => void;
}

export default function CompleteVaccinationDialog({
  open,
  onOpenChange,
  vaccination,
  onSuccess,
}: CompleteVaccinationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    completedDate: new Date().toISOString().split('T')[0],
    actualCost: '',
  });

  useEffect(() => {
    if (vaccination) {
      setFormData({
        completedDate: new Date().toISOString().split('T')[0],
        actualCost: '',
      });
    }
  }, [vaccination, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccination) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/vaccinations/${vaccination._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedDate: formData.completedDate,
          actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark vaccination as completed');
      }

      const costMessage = formData.actualCost
        ? ` An expense transaction of $${parseFloat(formData.actualCost).toFixed(2)} has been created.`
        : '';
      toast.success(`Vaccination marked as completed.${costMessage}`);
      setFormData({ completedDate: new Date().toISOString().split('T')[0], actualCost: '' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark vaccination as completed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vaccination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Vaccination</DialogTitle>
          <DialogDescription>
            Mark this vaccination as completed and optionally record the cost
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 border-y">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vaccine</p>
            <p className="font-medium">{vaccination.vaccineName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Batch</p>
            <p className="font-medium">{vaccination.batchId.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Date</p>
            <p className="font-medium">{formatDate(new Date(vaccination.scheduledDate), 'PP')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="completedDate">Completed Date</Label>
            <Input
              id="completedDate"
              type="date"
              value={formData.completedDate}
              onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualCost">Cost (Optional)</Label>
            <Input
              id="actualCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 500"
              value={formData.actualCost}
              onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If cost is provided, an expense transaction will be created automatically
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Completing...' : 'Complete Vaccination'}
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
