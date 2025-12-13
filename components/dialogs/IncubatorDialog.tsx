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

interface IncubatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IncubatorDialog({ open, onOpenChange }: IncubatorDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    batchId: '',
    inserted: '0',
    spoiled: '0',
    hatched: '0',
    notHatched: '0',
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
        // Sort batches: adults first (more likely to lay eggs for incubation), then chicks
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
      const response = await fetch('/api/incubator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: formData.batchId,
          inserted: parseInt(formData.inserted),
          spoiled: parseInt(formData.spoiled),
          hatched: parseInt(formData.hatched),
          notHatched: parseInt(formData.notHatched),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record incubator update');
      }

      toast.success(data.message || 'Incubator log recorded successfully');
      setFormData({ batchId: '', inserted: '0', spoiled: '0', hatched: '0', notHatched: '0' });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record incubator update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Incubator</DialogTitle>
          <DialogDescription>Record incubator batch details</DialogDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inserted">Eggs Inserted</Label>
              <Input
                id="inserted"
                type="number"
                min="0"
                value={formData.inserted}
                onChange={(e) => setFormData({ ...formData, inserted: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spoiled">Spoiled (Candling)</Label>
              <Input
                id="spoiled"
                type="number"
                min="0"
                value={formData.spoiled}
                onChange={(e) => setFormData({ ...formData, spoiled: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hatched">Hatched</Label>
              <Input
                id="hatched"
                type="number"
                min="0"
                value={formData.hatched}
                onChange={(e) => setFormData({ ...formData, hatched: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notHatched">Not Hatched</Label>
              <Input
                id="notHatched"
                type="number"
                min="0"
                value={formData.notHatched}
                onChange={(e) => setFormData({ ...formData, notHatched: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Update'}
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
