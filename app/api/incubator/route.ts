import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Incubator from '@/lib/models/Incubator';
import Batch from '@/lib/models/Batch';
import { requireAuth } from '@/lib/auth/get-session';
import { createIncubatorLogSchema } from '@/lib/validations/schemas';
import { format } from 'date-fns';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const incubatorLogs = await Incubator.find({ userId: session!.user.id }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: incubatorLogs,
    });
  } catch (error) {
    console.error('Incubator GET error:', error);
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

    const validatedFields = createIncubatorLogSchema.safeParse(body);

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

    const { batchId, inserted, spoiled, hatched, notHatched, date } = validatedFields.data;

    await connectDB();

    const incubator = await Incubator.create({
      userId: session!.user.id,
      batchId: new Types.ObjectId(batchId),
      inserted,
      spoiled,
      hatched,
      notHatched,
      date: date ? new Date(date) : new Date(),
    });

    let batch = null;

    if (hatched > 0) {
      const targetBatch = await Batch.findOne({ _id: batchId, userId: session!.user.id });
      if (targetBatch) {
        targetBatch.currentSize += hatched;
        await targetBatch.save();
        batch = targetBatch;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          incubator,
          batch: batch
            ? {
                id: batch._id,
                name: batch.name,
                currentSize: batch.currentSize,
              }
            : null,
        },
        message: 'Incubator log recorded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Incubator POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
