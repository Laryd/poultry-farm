import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFeed extends Document {
  userId: Types.ObjectId;
  type: string;
  price: number;
  bags: number;
  kgPerBag: number;
  totalKg: number;
  date: Date;
  createdAt: Date;
}

const FeedSchema: Schema<IFeed> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Feed type is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    bags: {
      type: Number,
      required: [true, 'Number of bags is required'],
      min: [1, 'Number of bags must be at least 1'],
    },
    kgPerBag: {
      type: Number,
      required: [true, 'Kg per bag is required'],
      min: [0.1, 'Kg per bag must be positive'],
    },
    totalKg: {
      type: Number,
      required: true,
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

FeedSchema.pre('save', function (next) {
  this.totalKg = this.bags * this.kgPerBag;
  next();
});

FeedSchema.index({ userId: 1, date: -1 });

const Feed: Model<IFeed> = mongoose.models.Feed || mongoose.model<IFeed>('Feed', FeedSchema);

export default Feed;
