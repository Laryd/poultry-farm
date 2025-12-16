import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Transaction from '@/lib/models/Transaction';
import { requireAuth } from '@/lib/auth/get-session';
import { createTransactionSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const batchId = searchParams.get('batch');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    const filter: any = { userId: session!.user.id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (batchId && Types.ObjectId.isValid(batchId)) {
      filter.batchId = new Types.ObjectId(batchId);
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('batchId', 'name batchCode')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Transactions GET error:', error);
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

    const validatedFields = createTransactionSchema.safeParse(body);

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

    const { type, category, amount, description, batchId, date } = validatedFields.data;

    await connectDB();

    const transactionData: any = {
      userId: session!.user.id,
      type,
      category,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
    };

    if (batchId && Types.ObjectId.isValid(batchId)) {
      transactionData.batchId = new Types.ObjectId(batchId);
    }

    const transaction = await Transaction.create(transactionData);

    return NextResponse.json(
      {
        success: true,
        data: transaction,
        message: 'Transaction recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Transaction POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
