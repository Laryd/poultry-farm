'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/date';
import { isSameDay, parseISO } from 'date-fns';
import CompleteVaccinationDialog from './CompleteVaccinationDialog';

interface Vaccination {
  _id: string;
  vaccineName: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  batchId: {
    name: string;
    batchCode?: string;
  };
}

interface VaccinationCalendarProps {
  batchId?: string;
  refreshKey?: number;
}

export default function VaccinationCalendar({ batchId, refreshKey }: VaccinationCalendarProps) {
  const router = useRouter();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);

  useEffect(() => {
    fetchVaccinations();
  }, [batchId, refreshKey]);

  const fetchVaccinations = async () => {
    try {
      const url = batchId ? `/api/vaccinations?batch=${batchId}` : '/api/vaccinations';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setVaccinations(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch vaccinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchVaccinations();
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-600">Overdue</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get vaccinations for selected date
  const selectedDateVaccinations = selectedDate
    ? vaccinations.filter((v) => isSameDay(parseISO(v.scheduledDate), selectedDate))
    : [];

  // Get dates that have vaccinations
  const vaccinationDates = vaccinations.map((v) => parseISO(v.scheduledDate));

  // Modifier for calendar to highlight dates with vaccinations
  const modifiers = {
    vaccination: vaccinationDates,
    overdue: vaccinations
      .filter((v) => v.status === 'overdue')
      .map((v) => parseISO(v.scheduledDate)),
    completed: vaccinations
      .filter((v) => v.status === 'completed')
      .map((v) => parseISO(v.scheduledDate)),
  };

  const modifiersClassNames = {
    vaccination: 'bg-blue-100 dark:bg-blue-900 font-bold',
    overdue: 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100',
    completed: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100',
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Vaccination Schedule
        </CardTitle>
        <CardDescription>View and manage vaccination schedules on the calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border"
              />

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900"></div>
                  <span>Overdue</span>
                </div>
              </div>
            </div>

            {/* Vaccinations for selected date */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedDate ? formatDate(selectedDate, 'PP') : 'Select a date'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDateVaccinations.length} vaccination(s) scheduled
                </p>
              </div>

              {selectedDateVaccinations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vaccinations scheduled for this date
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateVaccinations.map((vaccination) => (
                    <div
                      key={vaccination._id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{vaccination.vaccineName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vaccination.batchId.name} ({vaccination.batchId.batchCode})
                          </p>
                        </div>
                        {getStatusBadge(vaccination.status)}
                      </div>

                      {vaccination.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsCompleted(vaccination)}
                          className="w-full"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CompleteVaccinationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vaccination={selectedVaccination}
        onSuccess={handleDialogSuccess}
      />
    </Card>
  );
}
