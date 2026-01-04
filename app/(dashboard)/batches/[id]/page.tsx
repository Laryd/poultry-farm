import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import Mortality from '@/lib/models/Mortality';
import Vaccination from '@/lib/models/Vaccination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Archive } from 'lucide-react';
import Link from 'next/link';
import { formatDate, daysBetween } from '@/lib/utils/date';
import AddVaccinesButton from '@/components/batches/AddVaccinesButton';
import DownloadVaccinationsButton from '@/components/batches/DownloadVaccinationsButton';

async function getBatchDetails(batchId: string, userId: string) {
  await connectDB();

  const batch = await Batch.findOne({ _id: batchId, userId }).lean();

  if (!batch) {
    return null;
  }

  const mortalityRecords = await Mortality.find({ batchId })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const vaccinations = await Vaccination.find({ batchId })
    .sort({ scheduledDate: -1 })
    .lean();

  return {
    batch: {
      ...batch,
      _id: batch._id.toString(),
      userId: batch.userId.toString(),
      startDate: batch.startDate.toISOString(),
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
    },
    mortalityRecords: mortalityRecords.map((m) => ({
      ...m,
      _id: m._id.toString(),
      batchId: m.batchId.toString(),
      userId: m.userId.toString(),
      date: m.date.toISOString(),
      createdAt: m.createdAt.toISOString(),
    })),
    vaccinations: vaccinations.map((v) => ({
      ...v,
      _id: v._id.toString(),
      batchId: v.batchId.toString(),
      userId: v.userId.toString(),
      scheduledDate: v.scheduledDate.toISOString(),
      completedDate: v.completedDate?.toISOString(),
      createdAt: v.createdAt.toISOString(),
    })),
  };
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

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const data = await getBatchDetails(id, session.user.id);

  if (!data) {
    notFound();
  }

  const { batch, mortalityRecords, vaccinations } = data;
  const ageInDays = daysBetween(new Date(batch.startDate), new Date());
  const ageWeeks = Math.floor(ageInDays / 7);
  const mortalityRate = batch.initialSize > 0
    ? ((batch.initialSize - batch.currentSize) / batch.initialSize * 100).toFixed(1)
    : '0.0';
  const totalMortalities = batch.initialSize - batch.currentSize;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/batches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
              {getStatusBadge(ageInDays, batch.archived)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Batch Code: <span className="font-mono font-semibold">{batch.batchCode}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/batches/${batch._id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {batch.currentSize}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              birds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Initial Size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-500 dark:text-gray-400">
              {batch.initialSize}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              birds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Age</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {ageInDays}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              days ({ageWeeks} weeks)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mortality Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {mortalityRate}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalMortalities} deaths
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Breed</p>
                <p className="font-semibold text-gray-900 dark:text-white">{batch.breed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(new Date(batch.startDate))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(new Date(batch.createdAt))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(new Date(batch.updatedAt))}
                </p>
              </div>
            </div>
            {(batch.maleCount !== undefined || batch.femaleCount !== undefined) && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Gender Breakdown</p>
                <div className="grid grid-cols-2 gap-4">
                  {batch.maleCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Male</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{batch.maleCount} birds</p>
                    </div>
                  )}
                  {batch.femaleCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Female</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{batch.femaleCount} birds</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Mortality Records</CardTitle>
            <CardDescription>Last 10 mortality events</CardDescription>
          </CardHeader>
          <CardContent>
            {mortalityRecords.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No mortality records found
              </p>
            ) : (
              <div className="space-y-3">
                {mortalityRecords.map((record) => (
                  <div
                    key={record._id}
                    className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {record.count} bird{record.count > 1 ? 's' : ''}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(record.date))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vaccination Schedule</CardTitle>
              <CardDescription>Scheduled and completed vaccinations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DownloadVaccinationsButton
                batch={batch}
                vaccinations={vaccinations}
              />
              <AddVaccinesButton
                batchId={batch._id}
                batchName={batch.name}
                batchStartDate={batch.startDate}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vaccinations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No vaccinations scheduled
            </p>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vaccination) => (
                <div
                  key={vaccination._id}
                  className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {vaccination.vaccineName}
                      </p>
                      <Badge
                        variant={vaccination.completedDate ? 'default' : 'secondary'}
                        className={vaccination.completedDate ? 'bg-green-500' : ''}
                      >
                        {vaccination.completedDate ? 'Completed' : 'Scheduled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      At {vaccination.ageInDays} days
                    </p>
                    {vaccination.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {vaccination.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vaccination.completedDate
                        ? formatDate(new Date(vaccination.completedDate))
                        : formatDate(new Date(vaccination.scheduledDate))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
