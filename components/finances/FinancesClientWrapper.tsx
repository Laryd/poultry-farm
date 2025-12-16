'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TransactionDialog from '@/components/dialogs/TransactionDialog';
import FinancialSummary from '@/components/finances/FinancialSummary';
import TransactionsList from '@/components/finances/TransactionsList';
import FinancialCharts from '@/components/finances/FinancialCharts';

interface Batch {
  _id: string;
  batchCode: string;
  name: string;
}

export default function FinancesClientWrapper() {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  useEffect(() => {
    fetchBatches();
  }, []);

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDialogClose = (open: boolean) => {
    setTransactionDialogOpen(open);
    if (!open) {
      handleRefresh();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-64">
          <Label htmlFor="batch-filter" className="mb-2 block">
            Filter by Batch
          </Label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger id="batch-filter">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches (Consolidated)</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch._id} value={batch._id}>
                  {batch.name} ({batch.batchCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setTransactionDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <FinancialSummary refreshKey={refreshKey} batchId={selectedBatch === 'all' ? undefined : selectedBatch} />

      <FinancialCharts refreshKey={refreshKey} batchId={selectedBatch === 'all' ? undefined : selectedBatch} />

      <TransactionsList refreshKey={refreshKey} onRefresh={handleRefresh} batchId={selectedBatch === 'all' ? undefined : selectedBatch} />

      <TransactionDialog open={transactionDialogOpen} onOpenChange={handleDialogClose} />
    </>
  );
}
