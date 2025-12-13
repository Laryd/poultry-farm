import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Mortality from '@/lib/models/Mortality';
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
        { success: false, error: 'Invalid mortality record ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const mortality = await Mortality.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!mortality) {
      return NextResponse.json(
        { success: false, error: 'Mortality record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mortality record deleted successfully',
    });
  } catch (error) {
    console.error('Mortality DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
