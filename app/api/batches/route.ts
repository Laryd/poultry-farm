import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import { requireAuth } from '@/lib/auth/get-session';
import { createBatchSchema } from '@/lib/validations/schemas';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const batches = await Batch.find({ userId: session!.user.id }).sort({ startDate: -1 });

    return NextResponse.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Batches GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateBatchCode(): Promise<string> {
  const prefix = 'B';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();

    const validatedFields = createBatchSchema.safeParse(body);

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

    const { name, currentSize, breed, category, startDate } = validatedFields.data;
    let { batchCode } = validatedFields.data;

    await connectDB();

    if (!batchCode) {
      batchCode = await generateBatchCode();
      let attempts = 0;
      while (await Batch.findOne({ batchCode }) && attempts < 5) {
        batchCode = await generateBatchCode();
        attempts++;
      }
    }

    const batch = await Batch.create({
      userId: session!.user.id,
      batchCode,
      name,
      currentSize,
      initialSize: currentSize,
      breed,
      category,
      startDate: new Date(startDate),
      archived: false,
    });

    return NextResponse.json(
      {
        success: true,
        data: batch,
        message: 'Batch created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batches POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
