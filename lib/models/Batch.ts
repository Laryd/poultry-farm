import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { daysBetween } from '@/lib/utils/date';

export interface IBatch extends Document {
  userId: Types.ObjectId;
  batchCode: string;
  name: string;
  currentSize: number;
  initialSize: number;
  breed: string;
  category: 'chick' | 'adult';
  startDate: Date;
  archived: boolean;
  totalCost?: number;
  costPerBird?: number;
  createdAt: Date;
  updatedAt: Date;
  getAgeInDays(): number;
  isChick(): boolean;
  canLayEggs(): boolean;
  reduceSize(count: number): Promise<void>;
}

interface IBatchModel extends Model<IBatch> {
  getFirstActiveBatch(userId: Types.ObjectId): Promise<IBatch | null>;
}

const BatchSchema: Schema<IBatch> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    batchCode: {
      type: String,
      required: [true, 'Batch code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
    },
    currentSize: {
      type: Number,
      required: [true, 'Batch size is required'],
      min: [0, 'Batch size cannot be negative'],
    },
    initialSize: {
      type: Number,
      required: [true, 'Initial size is required'],
      min: [1, 'Initial size must be at least 1'],
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['chick', 'adult'],
      required: [true, 'Category is required'],
      default: 'chick',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    archived: {
      type: Boolean,
      default: false,
    },
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
    },
    costPerBird: {
      type: Number,
      min: [0, 'Cost per bird cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

BatchSchema.index({ userId: 1, archived: 1 });
BatchSchema.index({ startDate: 1 });

BatchSchema.pre('save', function (next) {
  if (this.totalCost && this.initialSize > 0) {
    this.costPerBird = this.totalCost / this.initialSize;
  }
  next();
});

BatchSchema.methods.getAgeInDays = function (): number {
  return daysBetween(this.startDate, new Date());
};

BatchSchema.methods.isChick = function (): boolean {
  return this.category === 'chick';
};

BatchSchema.methods.canLayEggs = function (): boolean {
  return this.getAgeInDays() >= 135;
};

BatchSchema.methods.reduceSize = async function (count: number): Promise<void> {
  this.currentSize = Math.max(0, this.currentSize - count);
  await this.save();
};

BatchSchema.statics.getFirstActiveBatch = async function (
  userId: Types.ObjectId
): Promise<IBatch | null> {
  return this.findOne({ userId, archived: false }).sort({ startDate: 1 });
};

const Batch: IBatchModel =
  (mongoose.models.Batch as IBatchModel) ||
  mongoose.model<IBatch, IBatchModel>('Batch', BatchSchema);

export default Batch;
