import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Egg from '@/lib/models/Egg';
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
        { success: false, error: 'Invalid egg record ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const egg = await Egg.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!egg) {
      return NextResponse.json(
        { success: false, error: 'Egg record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Egg record deleted successfully',
    });
  } catch (error) {
    console.error('Egg DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
