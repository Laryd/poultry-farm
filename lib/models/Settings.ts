import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'chickens' | 'eggs' | 'chicks' | 'other';
  minOrder: number;
  maxOrder: number;
  emoji: string;
  badges: string[];
  available: boolean;
  details: string[];
}

export interface ISettings extends Document {
  key: string;
  farmName: string;
  phone: string;
  deliveryFee: number;
  deliveryRegions: string;
  freeDeliveryThreshold: number;
  products: IProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  category: { type: String, enum: ['chickens', 'eggs', 'chicks', 'other'], default: 'other' },
  minOrder: { type: Number, default: 1, min: 1 },
  maxOrder: { type: Number, default: 100 },
  emoji: { type: String, default: '📦' },
  badges: [{ type: String }],
  available: { type: Boolean, default: true },
  details: [{ type: String }],
}, { _id: false });

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: 'global', unique: true },
    farmName: { type: String, default: 'FreshFarm Poultry' },
    phone: { type: String, default: '+254 700 000 000' },
    deliveryFee: { type: Number, default: 300 },
    deliveryRegions: { type: String, default: 'Nairobi & environs' },
    freeDeliveryThreshold: { type: Number, default: 5000 },
    products: { type: [ProductSchema], default: [] },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
