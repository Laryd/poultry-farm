import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VaccineTemplate from '@/lib/models/VaccineTemplate';
import { requireAuth } from '@/lib/auth/get-session';
import { createVaccineTemplateSchema } from '@/lib/validations/schemas';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const templates = await VaccineTemplate.find({
      userId: session!.user.id,
      active: true
    }).sort({ ageInDays: 1 });

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Vaccine templates GET error:', error);
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

    const validatedFields = createVaccineTemplateSchema.safeParse(body);

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

    const { name, defaultCost, ageInDays, description } = validatedFields.data;

    await connectDB();

    const template = await VaccineTemplate.create({
      userId: session!.user.id,
      name,
      defaultCost,
      ageInDays,
      description,
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Vaccine template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vaccine templates POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
