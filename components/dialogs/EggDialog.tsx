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
  batchCode: string;
  name: string;
  category: 'chick' | 'adult';
}

interface EggDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EggDialog({ open, onOpenChange }: EggDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    batchId: '',
    collected: '0',
    sold: '0',
    spoiled: '0',
  });

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      const result = await response.json();
      if (result.success) {
        const activeBatches = result.data.filter((b: any) => !b.archived);
        // Sort batches: adults first (for egg laying), then chicks
        const sortedBatches = activeBatches.sort((a: Batch, b: Batch) => {
          if (a.category === 'adult' && b.category === 'chick') return -1;
          if (a.category === 'chick' && b.category === 'adult') return 1;
          return 0;
        });
        setBatches(sortedBatches);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/eggs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: formData.batchId,
          collected: parseInt(formData.collected),
          sold: parseInt(formData.sold),
          spoiled: parseInt(formData.spoiled),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record eggs');
      }

      toast.success(data.message || 'Egg log recorded successfully');
      setFormData({ batchId: '', collected: '0', sold: '0', spoiled: '0' });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record eggs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Eggs</DialogTitle>
          <DialogDescription>Record today&apos;s egg collection</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Batch <span className="text-red-500">*</span></Label>
            <Select
              value={formData.batchId}
              onValueChange={(value) => setFormData({ ...formData, batchId: value })}
              required
            >
              <SelectTrigger id="batchId">
                <SelectValue placeholder="Select a batch" />
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
            <Label htmlFor="collected">Eggs Collected</Label>
            <Input
              id="collected"
              type="number"
              min="0"
              value={formData.collected}
              onChange={(e) => setFormData({ ...formData, collected: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sold">Eggs Sold</Label>
            <Input
              id="sold"
              type="number"
              min="0"
              value={formData.sold}
              onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spoiled">Eggs Spoiled</Label>
            <Input
              id="spoiled"
              type="number"
              min="0"
              value={formData.spoiled}
              onChange={(e) => setFormData({ ...formData, spoiled: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Eggs'}
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
