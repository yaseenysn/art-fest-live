import { Schema, models, model } from 'mongoose';
import { IStudent } from '../types';

const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  className: { type: String },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Student = models.Student || model<IStudent>('Student', StudentSchema);
