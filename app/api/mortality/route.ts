import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Mortality from '@/lib/models/Mortality';
import Batch from '@/lib/models/Batch';
import { requireAuth } from '@/lib/auth/get-session';
import { createMortalitySchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const mortalityLogs = await Mortality.find({ userId: session!.user.id })
      .populate('batchId', 'name')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: mortalityLogs,
    });
  } catch (error) {
    console.error('Mortality GET error:', error);
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

    const validatedFields = createMortalitySchema.safeParse(body);

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

    const { batchId, count, notes } = validatedFields.data;

    if (!Types.ObjectId.isValid(batchId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const batch = await Batch.findOne({ _id: batchId, userId: session!.user.id });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    const ageGroup = batch.isChick() ? 'chick' : 'adult';

    const mortality = await Mortality.create({
      userId: session!.user.id,
      batchId,
      ageGroup,
      count,
      notes,
      date: new Date(),
    });

    await batch.reduceSize(count);

    return NextResponse.json(
      {
        success: true,
        data: {
          mortality,
          batch: {
            id: batch._id,
            name: batch.name,
            currentSize: batch.currentSize,
          },
        },
        message: 'Mortality recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mortality POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
