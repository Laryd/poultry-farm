import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Feed from '@/lib/models/Feed';
import Transaction from '@/lib/models/Transaction';
import { requireAuth } from '@/lib/auth/get-session';
import { createFeedLogSchema } from '@/lib/validations/schemas';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const feedLogs = await Feed.find({ userId: session!.user.id }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: feedLogs,
    });
  } catch (error) {
    console.error('Feed GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();

    const validatedFields = createFeedLogSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { type, price, bags, kgPerBag, date } = validatedFields.data;

    await connectDB();

    const feed = await Feed.create({
      userId: session!.user.id,
      type,
      price,
      bags,
      kgPerBag,
      totalKg: bags * kgPerBag,
      date: date ? new Date(date) : new Date(),
    });

    // Auto-create expense transaction if price > 0
    if (price > 0) {
      await Transaction.create({
        userId: session!.user.id,
        type: 'expense',
        category: 'Feed',
        amount: price,
        description: `Feed purchase: ${bags} bags of ${type} (${bags * kgPerBag}kg total)`,
        feedId: feed._id,
        date: feed.date,
      });

      // Revalidate pages that show financial data
      revalidatePath('/dashboard');
      revalidatePath('/finances');
    }

    return NextResponse.json(
      {
        success: true,
        data: feed,
        message: 'Feed purchase recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feed POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
