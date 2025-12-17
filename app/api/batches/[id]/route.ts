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

    // Get current batch to check currentSize
    const existingBatch = await Batch.findOne({ _id: id, userId: session!.user.id });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Validate gender counts don't exceed batch size
    const maleCount = validatedFields.data.maleCount ?? existingBatch.maleCount ?? 0;
    const femaleCount = validatedFields.data.femaleCount ?? existingBatch.femaleCount ?? 0;

    if (maleCount + femaleCount > existingBatch.currentSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Gender counts (${maleCount} males + ${femaleCount} females = ${maleCount + femaleCount}) cannot exceed batch size (${existingBatch.currentSize})`,
        },
        { status: 400 }
      );
    }

    const batch = await Batch.findOneAndUpdate(
      { _id: id, userId: session!.user.id },
      { $set: validatedFields.data },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Revalidate pages that display batch data
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/dashboard');
    revalidatePath(`/batches/${id}`);
    revalidatePath(`/batches/${id}/edit`);
    revalidatePath('/batches');

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
