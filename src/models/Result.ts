import { Schema, models, model } from 'mongoose';
import { IResult } from '../types';

const ResultSchema = new Schema<IResult>({
  programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  studentName: { type: String, required: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  position: { type: Number, enum: [1, 2, 3], required: true },
  points: { type: Number, required: true },
  revealed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Removed unique index on programId and position to allow multiple winners for the same position

export const Result = models.Result || model<IResult>('Result', ResultSchema);
