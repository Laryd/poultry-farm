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
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPENSE_CATEGORIES = [
  'Feed',
  'Stock Purchase',
  'Medication',
  'Vaccines',
  'Utilities',
  'Labor',
  'Equipment',
  'Transportation',
  'Repairs & Maintenance',
  'Other Expenses',
];

const INCOME_CATEGORIES = [
  'Egg Sales',
  'Chicken Sales',
  'Manure Sales',
  'Other Income',
];

export default function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    batchId: '',
    date: new Date().toISOString().split('T')[0],
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
        setBatches(activeBatches);
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          batchId: formData.batchId || undefined,
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record transaction');
      }

      toast.success(data.message || 'Transaction recorded successfully');
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        batchId: '',
        date: new Date().toISOString().split('T')[0],
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>Add income or expense for your poultry farm</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => {
                setFormData({ ...formData, type: value, category: '' });
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">💸 Expense</SelectItem>
                <SelectItem value="income">💰 Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Input
              id="description"
              placeholder="Brief description of the transaction"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchId">Batch (Optional)</Label>
            <Select
              value={formData.batchId || undefined}
              onValueChange={(value) => setFormData({ ...formData, batchId: value })}
            >
              <SelectTrigger id="batchId">
                <SelectValue placeholder="No specific batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.name} ({batch.batchCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Transaction'}
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
