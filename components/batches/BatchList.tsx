'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';

interface Batch {
  _id: string;
  batchCode: string;
  name: string;
  currentSize: number;
  initialSize: number;
  breed: string;
  startDate: string;
  archived: boolean;
}

interface BatchListProps {
  batches: Batch[];
}

function calculateAge(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getStatusBadge(ageInDays: number, archived: boolean) {
  if (archived) {
    return <Badge variant="secondary">Archived</Badge>;
  }
  if (ageInDays < 90) {
    return <Badge className="bg-blue-500">Chick</Badge>;
  }
  if (ageInDays >= 135) {
    return <Badge className="bg-green-500">Layer</Badge>;
  }
  return <Badge className="bg-yellow-500">Growing</Badge>;
}

export default function BatchList({ batches }: BatchListProps) {
  const activeBatches = batches.filter((b) => !b.archived);
  const archivedBatches = batches.filter((b) => b.archived);

  const renderBatchCard = (batch: Batch) => {
    const ageInDays = calculateAge(batch.startDate);
    const mortalityRate = batch.initialSize > 0
      ? ((batch.initialSize - batch.currentSize) / batch.initialSize * 100).toFixed(1)
      : '0.0';

    return (
      <Card key={batch._id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{batch.name}</CardTitle>
                {getStatusBadge(ageInDays, batch.archived)}
              </div>
              <CardDescription>
                Code: <span className="font-mono font-semibold">{batch.batchCode}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {batch.currentSize}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Initial Size</p>
              <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                {batch.initialSize}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Breed</p>
              <p className="font-semibold text-gray-900 dark:text-white">{batch.breed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {ageInDays} days ({Math.floor(ageInDays / 7)} weeks)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(new Date(batch.startDate))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mortality Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">{mortalityRate}%</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Link href={`/batches/${batch._id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            <Link href={`/batches/${batch._id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No batches found
          </p>
          <Link href="/batches/new">
            <Button>Create Your First Batch</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeBatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Batches ({activeBatches.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeBatches.map(renderBatchCard)}
          </div>
        </div>
      )}

      {archivedBatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            Archived Batches ({archivedBatches.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {archivedBatches.map(renderBatchCard)}
          </div>
        </div>
      )}
    </div>
  );
}
