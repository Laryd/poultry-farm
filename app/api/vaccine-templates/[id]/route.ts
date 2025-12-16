import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VaccineTemplate from '@/lib/models/VaccineTemplate';
import Vaccination from '@/lib/models/Vaccination';
import { requireAuth } from '@/lib/auth/get-session';
import { updateVaccineTemplateSchema } from '@/lib/validations/schemas';
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
        { success: false, error: 'Invalid vaccine template ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validatedFields = updateVaccineTemplateSchema.safeParse(body);

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

    const template = await VaccineTemplate.findOneAndUpdate(
      { _id: id, userId: session!.user.id },
      { $set: validatedFields.data },
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Vaccine template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Vaccine template updated successfully',
    });
  } catch (error) {
    console.error('Vaccine template PATCH error:', error);
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
        { success: false, error: 'Invalid vaccine template ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if template is referenced by any vaccinations
    const vaccinationCount = await Vaccination.countDocuments({
      vaccineTemplateId: id,
      userId: session!.user.id,
    });

    if (vaccinationCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete template: ${vaccinationCount} vaccination(s) reference this template. Consider deactivating instead.`,
        },
        { status: 400 }
      );
    }

    const template = await VaccineTemplate.findOneAndDelete({
      _id: id,
      userId: session!.user.id,
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Vaccine template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vaccine template deleted successfully',
    });
  } catch (error) {
    console.error('Vaccine template DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
