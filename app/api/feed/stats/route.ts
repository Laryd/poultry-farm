import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Feed from '@/lib/models/Feed';
import { requireAuth } from '@/lib/auth/get-session';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const stats = await Feed.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(session!.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalBags: { $sum: '$bags' },
          totalKg: { $sum: '$totalKg' },
          totalSpent: { $sum: '$price' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalBags: stats[0]?.totalBags || 0,
        totalKg: stats[0]?.totalKg || 0,
        totalSpent: stats[0]?.totalSpent || 0,
      },
    });
  } catch (error) {
    console.error('Feed stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
