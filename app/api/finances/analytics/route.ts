import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Transaction from '@/lib/models/Transaction';
import { requireAuth } from '@/lib/auth/get-session';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6months'; // 6months, 1year, all
    const batchId = searchParams.get('batch');

    await connectDB();

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '30days':
        startDate = subMonths(new Date(), 1);
        break;
      case '1month':
        startDate = startOfMonth(new Date());
        break;
      case '3months':
        startDate = subMonths(new Date(), 3);
        break;
      case '1year':
        startDate = subMonths(new Date(), 12);
        break;
      case '6months':
      default:
        startDate = subMonths(new Date(), 6);
        break;
    }

    const filter: any = {
      userId: new Types.ObjectId(session!.user.id),
      date: { $gte: startDate, $lte: endDate },
    };

    if (batchId && Types.ObjectId.isValid(batchId)) {
      filter.batchId = new Types.ObjectId(batchId);
    }

    // Get total income and expenses
    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalIncome = summary.find((s) => s._id === 'income')?.total || 0;
    const totalExpenses = summary.find((s) => s._id === 'expense')?.total || 0;
    const netProfit = totalIncome - totalExpenses;

    // Get breakdown by category
    const categoryBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Get monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly trends
    const formattedMonthlyTrends: any = {};
    monthlyTrends.forEach((trend) => {
      const key = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
      if (!formattedMonthlyTrends[key]) {
        formattedMonthlyTrends[key] = { month: key, income: 0, expenses: 0 };
      }
      if (trend._id.type === 'income') {
        formattedMonthlyTrends[key].income = trend.total;
      } else {
        formattedMonthlyTrends[key].expenses = trend.total;
      }
    });

    const monthlyData = Object.values(formattedMonthlyTrends).map((month: any) => ({
      ...month,
      profit: month.income - month.expenses,
    }));

    // Get recent transactions
    const recentTransactions = await Transaction.find(filter)
      .populate('batchId', 'name batchCode')
      .sort({ date: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
        },
        categoryBreakdown,
        monthlyTrends: monthlyData,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
