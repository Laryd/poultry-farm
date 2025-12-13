import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import { requireAuth } from '@/lib/auth/get-session';
import { updateBatchSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const batch = await Batch.findOne({ _id: id, userId: session!.user.id });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Batch GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
        { success: false, error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validatedFields = updateBatchSchema.safeParse(body);

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

    await connectDB();

    const batch = await Batch.findOneAndUpdate(
      { _id: id, userId: session!.user.id },
      { $set: validatedFields.data },
      { new: true }
    );

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: batch,
      message: 'Batch updated successfully',
    });
  } catch (error) {
    console.error('Batch PATCH error:', error);
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
        { success: false, error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const batch = await Batch.findOne({
      _id: id,
      userId: session!.user.id,
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Import models dynamically to delete associated records
    const Egg = (await import('@/lib/models/Egg')).default;
    const Vaccination = (await import('@/lib/models/Vaccination')).default;
    const Mortality = (await import('@/lib/models/Mortality')).default;
    const Incubator = (await import('@/lib/models/Incubator')).default;
    const Feed = (await import('@/lib/models/Feed')).default;

    // Delete all associated records
    await Promise.all([
      Egg.deleteMany({ batchId: id, userId: session!.user.id }),
      Vaccination.deleteMany({ batchId: id, userId: session!.user.id }),
      Mortality.deleteMany({ batchId: id, userId: session!.user.id }),
      Incubator.deleteMany({ batchId: id, userId: session!.user.id }),
      Feed.deleteMany({ batchId: id, userId: session!.user.id }),
    ]);

    // Finally delete the batch itself
    await Batch.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Batch and all associated records deleted successfully',
    });
  } catch (error) {
    console.error('Batch DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
