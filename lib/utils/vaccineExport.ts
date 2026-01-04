import { format } from 'date-fns';

export interface VaccinationData {
  _id: string;
  vaccineName: string;
  ageInDays: number;
  scheduledDate: string;
  completedDate?: string;
  actualCost?: number;
  notes?: string;
}

export interface BatchData {
  _id: string;
  name: string;
  batchCode: string;
  breed: string;
  startDate: string;
  currentSize: number;
  initialSize: number;
  maleCount?: number;
  femaleCount?: number;
}

export interface CategorizedVaccines {
  completed: VaccinationData[];
  upcoming: VaccinationData[];
}

/**
 * Categorize vaccines into completed and upcoming
 */
export function categorizeVaccines(vaccinations: VaccinationData[]): CategorizedVaccines {
  const completed: VaccinationData[] = [];
  const upcoming: VaccinationData[] = [];

  vaccinations.forEach((vaccination) => {
    if (vaccination.completedDate) {
      completed.push(vaccination);
    } else {
      upcoming.push(vaccination);
    }
  });

  // Sort completed by completion date (most recent first)
  completed.sort((a, b) =>
    new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime()
  );

  // Sort upcoming by scheduled date (earliest first)
  upcoming.sort((a, b) =>
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  return { completed, upcoming };
}

/**
 * Format date for display
 */
export function formatDateForExport(dateString: string): string {
  return format(new Date(dateString), 'MMM dd, yyyy');
}

/**
 * Calculate vaccine status
 */
export function getVaccineStatus(vaccination: VaccinationData): string {
  if (vaccination.completedDate) {
    return 'Completed';
  }

  const scheduledDate = new Date(vaccination.scheduledDate);
  const today = new Date();

  if (scheduledDate < today) {
    return 'Overdue';
  }

  return 'Scheduled';
}
