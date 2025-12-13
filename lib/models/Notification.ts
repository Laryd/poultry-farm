import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'vaccination' | 'mortality' | 'general';
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  relatedModel?: 'Vaccination' | 'Batch' | 'Mortality';
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['vaccination', 'mortality', 'general'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Vaccination', 'Batch', 'Mortality'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
