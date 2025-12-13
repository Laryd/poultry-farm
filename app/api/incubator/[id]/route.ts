import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Incubator from '@/lib/models/Incubator';
import { requireAuth } from '@/lib/auth/get-session';
import { Types } from 'mongoose';

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
        { success: false, error: 'Invalid incubator record ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const incubator = await Incubator.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!incubator) {
      return NextResponse.json(
        { success: false, error: 'Incubator record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Incubator record deleted successfully',
    });
  } catch (error) {
    console.error('Incubator DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
