import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vaccination from '@/lib/models/Vaccination';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { addDays, isSameDay, isAfter, isBefore } from 'date-fns';

export async function GET() {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = addDays(today, 1);

    // Find vaccinations that are due today or tomorrow and not completed
    const upcomingVaccinations = await Vaccination.find({
      scheduledDate: { $gte: today, $lte: tomorrow },
      completedDate: null,
    }).populate('batchId', 'name batchCode').populate('userId', 'email name');

    let notificationsCreated = 0;
    let emailsSent = 0;

    for (const vaccination of upcomingVaccinations) {
      const scheduledDate = new Date(vaccination.scheduledDate);
      const daysUntil = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Type assertion for populated fields
      const batchId = vaccination.batchId as any;
      const userId = vaccination.userId as any;

      let message = '';
      let shouldNotify = false;

      if (isSameDay(scheduledDate, today)) {
        message = `Vaccination "${vaccination.vaccineName}" for batch ${batchId.name} is scheduled TODAY!`;
        shouldNotify = true;
      } else if (isSameDay(scheduledDate, tomorrow)) {
        message = `Vaccination "${vaccination.vaccineName}" for batch ${batchId.name} is scheduled TOMORROW!`;
        shouldNotify = true;
      }

      if (shouldNotify) {
        // Check if notification already exists for this vaccination and date
        const existingNotification = await Notification.findOne({
          userId: vaccination.userId,
          relatedId: vaccination._id,
          createdAt: { $gte: today },
        });

        if (!existingNotification) {
          // Create in-app notification
          await Notification.create({
            userId: vaccination.userId,
            type: 'vaccination',
            title: 'Vaccination Reminder',
            message,
            relatedId: vaccination._id,
            relatedModel: 'Vaccination',
            read: false,
          });

          notificationsCreated++;

          // Send email notification
          if (process.env.RESEND_API_KEY) {
            try {
              const { Resend } = await import('resend');
              const resend = new Resend(process.env.RESEND_API_KEY);

              await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Poultry Farm <noreply@yourdomain.com>',
                to: userId.email,
                subject: 'Vaccination Reminder',
                html: `
                  <h2>Vaccination Reminder</h2>
                  <p>Hello ${userId.name},</p>
                  <p>${message}</p>
                  <p><strong>Details:</strong></p>
                  <ul>
                    <li>Vaccine: ${vaccination.vaccineName}</li>
                    <li>Batch: ${batchId.name} (${batchId.batchCode})</li>
                    <li>Scheduled Date: ${scheduledDate.toLocaleDateString()}</li>
                  </ul>
                  <p>Please ensure this vaccination is administered on time.</p>
                  <p>Best regards,<br>Poultry Farm Management System</p>
                `,
              });

              emailsSent++;
            } catch (emailError) {
              console.error('Failed to send email:', emailError);
              // Continue even if email fails
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${upcomingVaccinations.length} vaccinations`,
      notificationsCreated,
      emailsSent,
    });
  } catch (error) {
    console.error('Reminder check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
