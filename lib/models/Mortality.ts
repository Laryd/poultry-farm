import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMortality extends Document {
  userId: Types.ObjectId;
  batchId: Types.ObjectId;
  ageGroup: 'chick' | 'adult';
  count: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

const MortalitySchema: Schema<IMortality> = new Schema(
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
    ageGroup: {
      type: String,
      enum: ['chick', 'adult'],
      required: true,
    },
    count: {
      type: Number,
      required: [true, 'Mortality count is required'],
      min: [1, 'Mortality count must be at least 1'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MortalitySchema.index({ userId: 1, date: -1 });
MortalitySchema.index({ batchId: 1 });

const Mortality: Model<IMortality> =
  mongoose.models.Mortality || mongoose.model<IMortality>('Mortality', MortalitySchema);

export default Mortality;
