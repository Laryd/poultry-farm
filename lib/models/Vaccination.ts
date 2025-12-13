import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type VaccinationStatus = 'pending' | 'completed' | 'overdue';

export interface IVaccination extends Document {
  userId: Types.ObjectId;
  batchId: Types.ObjectId;
  vaccineName: string;
  scheduledDate: Date;
  completedDate?: Date;
  ageInDays: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinationSchema: Schema<IVaccination> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    completedDate: {
      type: Date,
    },
    ageInDays: {
      type: Number,
      required: [true, 'Age in days is required'],
      min: [0, 'Age in days cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

VaccinationSchema.index({ userId: 1, scheduledDate: -1 });
VaccinationSchema.index({ batchId: 1 });

const Vaccination: Model<IVaccination> =
  mongoose.models.Vaccination || mongoose.model<IVaccination>('Vaccination', VaccinationSchema);

export default Vaccination;
