import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Feed from '@/lib/models/Feed';
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
        { success: false, error: 'Invalid feed record ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const feed = await Feed.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!feed) {
      return NextResponse.json(
        { success: false, error: 'Feed record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feed record deleted successfully',
    });
  } catch (error) {
    console.error('Feed DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
