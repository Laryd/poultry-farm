'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddVaccinesToBatchDialog from './AddVaccinesToBatchDialog';

interface AddVaccinesButtonProps {
  batchId: string;
  batchName: string;
  batchStartDate: string;
}

export default function AddVaccinesButton({
  batchId,
  batchName,
  batchStartDate,
}: AddVaccinesButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Vaccines
      </Button>
      <AddVaccinesToBatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batchId={batchId}
        batchName={batchName}
        batchStartDate={batchStartDate}
      />
    </>
  );
}
