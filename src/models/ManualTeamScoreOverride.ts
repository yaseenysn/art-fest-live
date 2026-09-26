import mongoose, { Schema, models, model } from 'mongoose';

export interface IManualTeamScoreOverride {
  _id?: mongoose.Types.ObjectId | string;
  teamId: mongoose.Types.ObjectId | string;
  manualScore: number;
  updatedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const ManualTeamScoreOverrideSchema = new Schema<IManualTeamScoreOverride>({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
  manualScore: { type: Number, required: true, min: 0 },
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Force recompilation of model in Next.js development mode
if (mongoose.models.ManualTeamScoreOverride) {
  delete mongoose.models.ManualTeamScoreOverride;
}

export const ManualTeamScoreOverride = models.ManualTeamScoreOverride || model<IManualTeamScoreOverride>('ManualTeamScoreOverride', ManualTeamScoreOverrideSchema);
