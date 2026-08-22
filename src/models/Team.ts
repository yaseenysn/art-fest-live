import { Schema, models, model } from 'mongoose';
import { ITeam } from '../types';

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  shortName: { type: String },
  slug: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  logoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Case-insensitive unique index for team name
TeamSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const Team = models.Team || model<ITeam>('Team', TeamSchema);
