import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Egg from '@/lib/models/Egg';
import Batch from '@/lib/models/Batch';
import Transaction from '@/lib/models/Transaction';
import { requireAuth } from '@/lib/auth/get-session';
import { createEggLogSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const eggLogs = await Egg.find({ userId: session!.user.id }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: eggLogs,
    });
  } catch (error) {
    console.error('Eggs GET error:', error);
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

    const validatedFields = createEggLogSchema.safeParse(body);

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

    const { batchId, collected, sold, spoiled, date, pricePerEgg } = validatedFields.data;

    await connectDB();

    const egg = await Egg.create({
      userId: session!.user.id,
      batchId: new Types.ObjectId(batchId),
      collected,
      sold,
      spoiled,
      date: date ? new Date(date) : new Date(),
      pricePerEgg,
    });

    // Auto-create income transaction if eggs sold with price
    if (sold > 0 && pricePerEgg && pricePerEgg > 0) {
      const totalRevenue = sold * pricePerEgg;

      await Transaction.create({
        userId: session!.user.id,
        type: 'income',
        category: 'Egg Sales',
        amount: totalRevenue,
        description: `Egg sales: ${sold} eggs @ ${pricePerEgg.toFixed(2)} each`,
        batchId: new Types.ObjectId(batchId),
        eggId: egg._id,
        date: egg.date,
      });

      // Revalidate pages that show financial data
      revalidatePath('/dashboard');
      revalidatePath('/finances');
    }

    return NextResponse.json(
      {
        success: true,
        data: egg,
        message: 'Egg log recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Eggs POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
