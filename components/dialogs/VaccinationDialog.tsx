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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Batch {
  _id: string;
  name: string;
  batchCode: string;
  category: 'chick' | 'adult';
}

interface VaccinationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VaccinationDialog({ open, onOpenChange }: VaccinationDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    batchId: '',
    vaccineName: '',
    ageInDays: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      const data = await response.json();
      if (data.success) {
        const activeBatches = data.data.filter((b: any) => !b.archived);
        // Sort batches: chicks first (more likely to need vaccinations), then adults
        const sortedBatches = activeBatches.sort((a: Batch, b: Batch) => {
          if (a.category === 'chick' && b.category === 'adult') return -1;
          if (a.category === 'adult' && b.category === 'chick') return 1;
          return 0;
        });
        setBatches(sortedBatches);
      }
    } catch (error) {
      toast.error('Failed to fetch batches');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: formData.batchId,
          vaccineName: formData.vaccineName,
          ageInDays: parseInt(formData.ageInDays),
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule vaccination');
      }

      toast.success('Vaccination scheduled successfully');
      setFormData({ batchId: '', vaccineName: '', ageInDays: '', notes: '' });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule vaccination');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Vaccination</DialogTitle>
          <DialogDescription>Schedule or record a vaccination</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Batch</Label>
            <Select value={formData.batchId} onValueChange={(value) => setFormData({ ...formData, batchId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.name} ({batch.batchCode}) - {batch.category === 'adult' ? '🐔 Adult' : '🐣 Chick'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vaccineName">Vaccine Name</Label>
            <Input
              id="vaccineName"
              placeholder="e.g., Newcastle Disease, Gumboro"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageInDays">Age in Days (for scheduling)</Label>
            <Input
              id="ageInDays"
              type="number"
              min="0"
              placeholder="e.g., 7, 14, 21"
              value={formData.ageInDays}
              onChange={(e) => setFormData({ ...formData, ageInDays: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.batchId}>
              {isLoading ? 'Scheduling...' : 'Schedule Vaccination'}
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
