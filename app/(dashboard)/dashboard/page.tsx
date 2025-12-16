import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import Mortality from '@/lib/models/Mortality';
import Egg from '@/lib/models/Egg';
import Feed from '@/lib/models/Feed';
import SummaryCards from '@/components/dashboard/SummaryCards';
import VaccineReminders from '@/components/notifications/VaccineReminders';
import BatchFilter from '@/components/dashboard/BatchFilter';
import DashboardClientWrapper from '@/components/dashboard/DashboardClientWrapper';
import DashboardFinancialSummary from '@/components/dashboard/DashboardFinancialSummary';
import { Types } from 'mongoose';

async function getDashboardData(userId: string, batchId?: string) {
  await connectDB();

  const batchFilter: any = { userId, archived: false };
  if (batchId && Types.ObjectId.isValid(batchId)) {
    batchFilter._id = batchId;
  }

  const batches = await Batch.find(batchFilter).lean();

  const totalBirds = batches.reduce((sum, batch) => sum + batch.currentSize, 0);

  const chickBatches = batches.filter((batch) => batch.category === 'chick');
  const adultBatches = batches.filter((batch) => batch.category === 'adult');

  const totalChicks = chickBatches.reduce((sum, batch) => sum + batch.currentSize, 0);
  const totalAdults = adultBatches.reduce((sum, batch) => sum + batch.currentSize, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const eggMatchFilter: any = {
    userId: new Types.ObjectId(userId),
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  };

  if (batchId && Types.ObjectId.isValid(batchId)) {
    eggMatchFilter.batchId = new Types.ObjectId(batchId);
  }

  const eggsToday = await Egg.aggregate([
    {
      $match: eggMatchFilter,
    },
    {
      $group: {
        _id: null,
        collected: { $sum: '$collected' },
        sold: { $sum: '$sold' },
        spoiled: { $sum: '$spoiled' },
      },
    },
  ]);

  const feedStats = await Feed.aggregate([
    {
      $match: { userId: new Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        totalBags: { $sum: '$bags' },
        totalKg: { $sum: '$totalKg' },
      },
    },
  ]);

  return {
    totalBirds,
    totalChicks,
    totalAdults,
    eggsCollectedToday: eggsToday[0]?.collected || 0,
    eggsSoldToday: eggsToday[0]?.sold || 0,
    eggsSpoiledToday: eggsToday[0]?.spoiled || 0,
    totalFeedBags: feedStats[0]?.totalBags || 0,
    totalFeedKg: feedStats[0]?.totalKg || 0,
  };
}

async function getAllBatches(userId: string) {
  await connectDB();
  const batches = await Batch.find({ userId, archived: false })
    .select('_id batchCode name')
    .sort({ startDate: -1 })
    .lean();

  return batches.map((batch) => ({
    _id: batch._id.toString(),
    batchCode: batch.batchCode,
    name: batch.name,
  }));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { batch: batchId } = await searchParams;

  const [data, allBatches] = await Promise.all([
    getDashboardData(session.user.id, batchId),
    getAllBatches(session.user.id),
  ]);

  const selectedBatch = batchId
    ? allBatches.find((b) => b._id === batchId)
    : null;

  return (
    <div className="space-y-8">
      <VaccineReminders />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {session.user.name}
            {selectedBatch && (
              <span className="ml-2">
                · Viewing: <span className="font-semibold">{selectedBatch.name}</span>
              </span>
            )}
          </p>
        </div>
        <BatchFilter batches={allBatches} />
      </div>

      <SummaryCards data={data} />

      <DashboardFinancialSummary batchId={batchId} />

      <DashboardClientWrapper batchId={batchId} />
    </div>
  );
}
