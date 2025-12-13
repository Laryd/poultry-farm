import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vaccination from '@/lib/models/Vaccination';
import Batch from '@/lib/models/Batch';
import { requireAuth } from '@/lib/auth/get-session';
import { createVaccinationSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';
import { addDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch');

    await connectDB();

    const filter: any = { userId: session!.user.id };
    if (batchId && Types.ObjectId.isValid(batchId)) {
      filter.batchId = new Types.ObjectId(batchId);
    }

    const vaccinations = await Vaccination.find(filter)
      .populate('batchId', 'name startDate')
      .sort({ scheduledDate: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vaccinationsWithStatus = vaccinations.map((vac) => {
      let status: 'completed' | 'pending' | 'overdue' = 'pending';

      if (vac.completedDate) {
        status = 'completed';
      } else if (vac.scheduledDate < today) {
        status = 'overdue';
      }

      return {
        ...vac.toObject(),
        status,
      };
    });

    return NextResponse.json({
      success: true,
      data: vaccinationsWithStatus,
    });
  } catch (error) {
    console.error('Vaccinations GET error:', error);
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

    const validatedFields = createVaccinationSchema.safeParse(body);

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

    const { batchId, vaccineName, ageInDays, notes } = validatedFields.data;

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

    const scheduledDate = addDays(batch.startDate, ageInDays);

    const vaccination = await Vaccination.create({
      userId: session!.user.id,
      batchId,
      vaccineName,
      scheduledDate,
      ageInDays,
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: vaccination,
        message: 'Vaccination scheduled successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vaccination POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
