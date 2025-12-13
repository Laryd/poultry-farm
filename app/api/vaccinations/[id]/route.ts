import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vaccination from '@/lib/models/Vaccination';
import { requireAuth } from '@/lib/auth/get-session';
import { markVaccinationCompleteSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vaccination ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validatedFields = markVaccinationCompleteSchema.safeParse(body);

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

    const { completedDate } = validatedFields.data;

    await connectDB();

    const vaccination = await Vaccination.findOneAndUpdate(
      { _id: id, userId: session!.user.id },
      { $set: { completedDate: completedDate ? new Date(completedDate) : new Date() } },
      { new: true }
    ).populate('batchId', 'name');

    if (!vaccination) {
      return NextResponse.json(
        { success: false, error: 'Vaccination not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vaccination,
      message: 'Vaccination marked as completed',
    });
  } catch (error) {
    console.error('Vaccination PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vaccination ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const vaccination = await Vaccination.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!vaccination) {
      return NextResponse.json(
        { success: false, error: 'Vaccination record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vaccination record deleted successfully',
    });
  } catch (error) {
    console.error('Vaccination DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
