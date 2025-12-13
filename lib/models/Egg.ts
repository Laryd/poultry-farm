import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEgg extends Document {
  userId: Types.ObjectId;
  batchId: Types.ObjectId;
  collected: number;
  sold: number;
  spoiled: number;
  date: Date;
  createdAt: Date;
}

const EggSchema: Schema<IEgg> = new Schema(
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
    collected: {
      type: Number,
      required: true,
      min: [0, 'Collected eggs cannot be negative'],
      default: 0,
    },
    sold: {
      type: Number,
      required: true,
      min: [0, 'Sold eggs cannot be negative'],
      default: 0,
    },
    spoiled: {
      type: Number,
      required: true,
      min: [0, 'Spoiled eggs cannot be negative'],
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

EggSchema.index({ userId: 1, date: -1 });

const Egg: Model<IEgg> = mongoose.models.Egg || mongoose.model<IEgg>('Egg', EggSchema);

export default Egg;
