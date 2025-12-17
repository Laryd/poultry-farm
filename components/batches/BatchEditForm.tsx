'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Batch {
  _id: string;
  batchCode: string;
  name: string;
  breed: string;
  category: 'chick' | 'adult';
  startDate: string;
  archived: boolean;
  maleCount?: number;
  femaleCount?: number;
}

interface BatchEditFormProps {
  batch: Batch;
}

export default function BatchEditForm({ batch }: BatchEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: batch.name,
    breed: batch.breed,
    category: batch.category,
    archived: batch.archived,
    maleCount: batch.maleCount ?? undefined,
    femaleCount: batch.femaleCount ?? undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build payload with only defined values to ensure fields are properly updated
      const payload: any = {
        name: formData.name,
        breed: formData.breed,
        category: formData.category,
        archived: formData.archived,
      };

      // Include gender counts if they have values (including 0)
      if (formData.maleCount !== undefined) {
        payload.maleCount = formData.maleCount;
      }
      if (formData.femaleCount !== undefined) {
        payload.femaleCount = formData.femaleCount;
      }

      const response = await fetch(`/api/batches/${batch._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update batch');
      }

      toast.success('Batch updated successfully');
      router.push(`/batches/${batch._id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update batch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/batches/${batch._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete batch');
      }

      toast.success('Batch deleted successfully');
      router.push('/batches');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete batch');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="batchCode">Batch Code</Label>
        <Input
          id="batchCode"
          value={batch.batchCode}
          disabled
          className="font-mono bg-gray-100 dark:bg-gray-800"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Batch code cannot be changed
        </p>
      </div>

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
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value: 'chick' | 'adult') => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chick">Chick (Day-Old to Young)</SelectItem>
            <SelectItem value="adult">Adult (Mature/Layers)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update if birds have matured from chicks to adults
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Gender Breakdown (Optional)</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track male and female counts when gender is known
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maleCount">Male Count</Label>
            <Input
              id="maleCount"
              type="number"
              min="0"
              placeholder="Optional"
              value={formData.maleCount ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const newValue = value === '' ? undefined : parseInt(value, 10);
                setFormData({ ...formData, maleCount: newValue });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="femaleCount">Female Count</Label>
            <Input
              id="femaleCount"
              type="number"
              min="0"
              placeholder="Optional"
              value={formData.femaleCount ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const newValue = value === '' ? undefined : parseInt(value, 10);
                setFormData({ ...formData, femaleCount: newValue });
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={batch.startDate}
          disabled
          className="bg-gray-100 dark:bg-gray-800"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start date cannot be changed
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="archived">Archive Batch</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Archived batches are hidden from active listings
          </p>
        </div>
        <Switch
          id="archived"
          checked={formData.archived}
          onCheckedChange={(checked) => setFormData({ ...formData, archived: checked })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/batches/${batch._id}`)}
        >
          Cancel
        </Button>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Deleting this batch will also delete all associated records (eggs, vaccinations, etc.)
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Batch
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete batch <span className="font-semibold">{batch.name} ({batch.batchCode})</span> and all
                  associated records including eggs, vaccinations, mortality records, and incubator logs.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Batch'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </form>
  );
}
