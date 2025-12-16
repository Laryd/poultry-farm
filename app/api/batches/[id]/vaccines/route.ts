import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import VaccineTemplate from '@/lib/models/VaccineTemplate';
import Vaccination from '@/lib/models/Vaccination';
import { requireAuth } from '@/lib/auth/get-session';
import { Types } from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id: batchId } = await params;

    if (!Types.ObjectId.isValid(batchId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { vaccineTemplateIds } = body;

    if (!vaccineTemplateIds || !Array.isArray(vaccineTemplateIds) || vaccineTemplateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one vaccine template' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify batch exists and belongs to user
    const batch = await Batch.findOne({
      _id: batchId,
      userId: session!.user.id,
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Fetch all selected templates
    const templates = await VaccineTemplate.find({
      _id: { $in: vaccineTemplateIds.map(id => new Types.ObjectId(id)) },
      userId: session!.user.id,
      active: true,
    });

    if (templates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid vaccine templates found' },
        { status: 400 }
      );
    }

    // Create vaccination records for each template
    const vaccinations = templates.map(template => {
      const scheduledDate = new Date(batch.startDate);
      scheduledDate.setDate(scheduledDate.getDate() + template.ageInDays);

      return {
        userId: session!.user.id,
        batchId: batch._id,
        vaccineTemplateId: template._id,
        vaccineName: template.name,
        scheduledDate,
        ageInDays: template.ageInDays,
      };
    });

    const insertedVaccinations = await Vaccination.insertMany(vaccinations);

    return NextResponse.json({
      success: true,
      count: insertedVaccinations.length,
      message: `${insertedVaccinations.length} vaccination(s) scheduled successfully`,
    });
  } catch (error) {
    console.error('Add vaccines to batch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
