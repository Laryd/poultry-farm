import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db/mongodb';
import Batch from '@/lib/models/Batch';
import Transaction from '@/lib/models/Transaction';
import VaccineTemplate from '@/lib/models/VaccineTemplate';
import Vaccination from '@/lib/models/Vaccination';
import { requireAuth } from '@/lib/auth/get-session';
import { createBatchSchema } from '@/lib/validations/schemas';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    await connectDB();

    const batches = await Batch.find({ userId: session!.user.id }).sort({ startDate: -1 });

    return NextResponse.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Batches GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateBatchCode(): Promise<string> {
  const prefix = 'B';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();

    const validatedFields = createBatchSchema.safeParse(body);

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

    const { name, currentSize, breed, category, startDate, totalCost, vaccineTemplateIds } = validatedFields.data;
    let { batchCode } = validatedFields.data;

    await connectDB();

    if (!batchCode) {
      batchCode = await generateBatchCode();
      let attempts = 0;
      while (await Batch.findOne({ batchCode }) && attempts < 5) {
        batchCode = await generateBatchCode();
        attempts++;
      }
    }

    const batch = await Batch.create({
      userId: session!.user.id,
      batchCode,
      name,
      currentSize,
      initialSize: currentSize,
      breed,
      category,
      startDate: new Date(startDate),
      archived: false,
      totalCost,
    });

    // Auto-create expense transaction if totalCost provided and > 0
    if (totalCost && totalCost > 0) {
      await Transaction.create({
        userId: session!.user.id,
        type: 'expense',
        category: 'Stock Purchase',
        amount: totalCost,
        description: `${category === 'chick' ? 'Chick' : 'Adult bird'} purchase: ${name} - ${currentSize} birds (${breed})`,
        batchId: batch._id,
        date: batch.startDate,
      });

      // Revalidate pages that show financial data
      revalidatePath('/dashboard');
      revalidatePath('/finances');
    }

    // Auto-create vaccinations from selected templates
    if (vaccineTemplateIds && vaccineTemplateIds.length > 0) {
      // Fetch all selected templates
      const templates = await VaccineTemplate.find({
        _id: { $in: vaccineTemplateIds.map(id => new Types.ObjectId(id)) },
        userId: session!.user.id,
        active: true,
      });

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

      if (vaccinations.length > 0) {
        await Vaccination.insertMany(vaccinations);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: batch,
        message: 'Batch created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batches POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
