import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Egg from '@/lib/models/Egg';
import { requireAuth } from '@/lib/auth/get-session';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');

    const monthsToShow = 6;
    const monthlyData = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const nextMonthStart = startOfMonth(subMonths(new Date(), i - 1));

      const monthKey = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'MMM yyyy');

      const matchFilter: any = {
        userId: new Types.ObjectId(session!.user.id),
        date: {
          $gte: monthStart,
          $lt: i === 0 ? new Date() : nextMonthStart,
        },
      };

      if (batchId && Types.ObjectId.isValid(batchId)) {
        matchFilter.batchId = new Types.ObjectId(batchId);
      }

      const eggs = await Egg.aggregate([
        {
          $match: matchFilter,
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

      monthlyData.push({
        month: monthLabel,
        monthKey,
        collected: eggs[0]?.collected || 0,
        sold: eggs[0]?.sold || 0,
        spoiled: eggs[0]?.spoiled || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error('Egg stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
