import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createBatchSchema = z.object({
  batchCode: z.string().optional(),
  name: z.string().min(1, 'Batch name is required'),
  currentSize: z.number().int().min(1, 'Batch size must be at least 1'),
  breed: z.string().min(1, 'Breed is required'),
  category: z.enum(['chick', 'adult']).default('chick'),
  startDate: z.string().or(z.date()),
  totalCost: z.number().min(0, 'Total cost cannot be negative').optional(),
});

export const updateBatchSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  category: z.enum(['chick', 'adult']).optional(),
  archived: z.boolean().optional(),
});

export const createMortalitySchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  count: z.number().int().min(1, 'Count must be at least 1'),
  notes: z.string().optional(),
});

export const createEggLogSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  collected: z.number().int().min(0, 'Collected eggs cannot be negative').default(0),
  sold: z.number().int().min(0, 'Sold eggs cannot be negative').default(0),
  spoiled: z.number().int().min(0, 'Spoiled eggs cannot be negative').default(0),
  date: z.string().or(z.date()).optional(),
  pricePerEgg: z.number().min(0, 'Price per egg cannot be negative').optional(),
});

export const createIncubatorLogSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  inserted: z.number().int().min(0, 'Inserted eggs cannot be negative').default(0),
  spoiled: z.number().int().min(0, 'Spoiled eggs cannot be negative').default(0),
  hatched: z.number().int().min(0, 'Hatched eggs cannot be negative').default(0),
  notHatched: z.number().int().min(0, 'Not hatched eggs cannot be negative').default(0),
  date: z.string().or(z.date()).optional(),
});

export const createFeedLogSchema = z.object({
  type: z.string().min(1, 'Feed type is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  bags: z.number().int().min(1, 'Number of bags must be at least 1'),
  kgPerBag: z.number().min(0.1, 'Kg per bag must be positive'),
  date: z.string().or(z.date()).optional(),
});

export const createVaccinationSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  ageInDays: z.number().int().min(0, 'Age in days cannot be negative'),
  notes: z.string().optional(),
});

export const markVaccinationCompleteSchema = z.object({
  completedDate: z.string().or(z.date()).optional(),
});

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  description: z.string().min(1, 'Description is required'),
  batchId: z.string().optional(),
  feedId: z.string().optional(),
  eggId: z.string().optional(),
  date: z.string().or(z.date()).optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  description: z.string().min(1).optional(),
  batchId: z.string().optional(),
  date: z.string().or(z.date()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type CreateMortalityInput = z.infer<typeof createMortalitySchema>;
export type CreateEggLogInput = z.infer<typeof createEggLogSchema>;
export type CreateIncubatorLogInput = z.infer<typeof createIncubatorLogSchema>;
export type CreateFeedLogInput = z.infer<typeof createFeedLogSchema>;
export type CreateVaccinationInput = z.infer<typeof createVaccinationSchema>;
export type MarkVaccinationCompleteInput = z.infer<typeof markVaccinationCompleteSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
