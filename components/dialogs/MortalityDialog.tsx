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
  currentSize: number;
  category: 'chick' | 'adult';
}

interface MortalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MortalityDialog({ open, onOpenChange }: MortalityDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    batchId: '',
    count: '',
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
        // Sort batches: chicks first, then adults
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
      const response = await fetch('/api/mortality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: formData.batchId,
          count: parseInt(formData.count),
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record mortality');
      }

      toast.success('Mortality recorded successfully');
      setFormData({ batchId: '', count: '', notes: '' });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record mortality');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Mortality</DialogTitle>
          <DialogDescription>Log bird deaths and update batch size</DialogDescription>
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
                    {batch.name} ({batch.batchCode}) - {batch.category === 'adult' ? '🐔 Adult' : '🐣 Chick'} ({batch.currentSize} birds)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Deaths</Label>
            <Input
              id="count"
              type="number"
              min="1"
              placeholder="e.g., 5"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g., cause of death"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading || !formData.batchId}>
              {isLoading ? 'Recording...' : 'Record Mortality'}
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
