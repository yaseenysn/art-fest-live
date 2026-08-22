import { Schema, models, model } from 'mongoose';
import { IProgram } from '../types';

const ProgramSchema = new Schema<IProgram>({
  name: { type: String, required: true },
  language: { type: String, required: true, default: 'Other' },
  category: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
  description: { type: String },
  programOrder: { type: Number, default: 0 },
  maxPoints: { type: Number },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  posterCreated: { type: Boolean, default: false },
  posterCreatedAt: { type: Date, default: null },
  posterCount: { type: Number, default: 0 },
  allWinnersPosterCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});


// Fix for Next.js HMR: Do not delete models.Program as it breaks stale references in API routes.
// Instead, always use the cached model if it exists.
export const Program = models.Program || model<IProgram>('Program', ProgramSchema);
