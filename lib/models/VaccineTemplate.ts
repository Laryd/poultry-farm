import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IVaccineTemplate extends Document {
  userId: Types.ObjectId;
  name: string;
  defaultCost: number;
  ageInDays: number;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VaccineTemplateSchema: Schema<IVaccineTemplate> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
    },
    defaultCost: {
      type: Number,
      required: [true, 'Default cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    ageInDays: {
      type: Number,
      required: [true, 'Age in days is required'],
      min: [0, 'Age in days cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's active templates
VaccineTemplateSchema.index({ userId: 1, active: 1 });
VaccineTemplateSchema.index({ userId: 1, name: 1 });

const VaccineTemplate: Model<IVaccineTemplate> =
  mongoose.models.VaccineTemplate ||
  mongoose.model<IVaccineTemplate>('VaccineTemplate', VaccineTemplateSchema);

export default VaccineTemplate;
