import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IIncubator extends Document {
  userId: Types.ObjectId;
  batchId: Types.ObjectId;
  inserted: number;
  spoiled: number;
  hatched: number;
  notHatched: number;
  date: Date;
  createdAt: Date;
}

const IncubatorSchema: Schema<IIncubator> = new Schema(
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
      required: [true, 'Batch is required'],
      index: true,
    },
    inserted: {
      type: Number,
      required: true,
      min: [0, 'Inserted eggs cannot be negative'],
      default: 0,
    },
    spoiled: {
      type: Number,
      required: true,
      min: [0, 'Spoiled eggs cannot be negative'],
      default: 0,
    },
    hatched: {
      type: Number,
      required: true,
      min: [0, 'Hatched eggs cannot be negative'],
      default: 0,
    },
    notHatched: {
      type: Number,
      required: true,
      min: [0, 'Not hatched eggs cannot be negative'],
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

IncubatorSchema.index({ userId: 1, date: -1 });

const Incubator: Model<IIncubator> =
  mongoose.models.Incubator || mongoose.model<IIncubator>('Incubator', IncubatorSchema);

export default Incubator;
