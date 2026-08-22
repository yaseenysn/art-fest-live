import mongoose from 'mongoose';

const LeaderboardRowSchema = new mongoose.Schema({
  id: { type: String, required: true },
  rank: { type: Number, required: true },
  name: { type: String, required: true },
  points: { type: mongoose.Schema.Types.Mixed }, // string or number
  color: { type: String }
}, { _id: false });

const LeaderboardConfigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  showPoints: { type: Boolean, required: true },
  showColor: { type: Boolean, required: true },
  presentation: { type: String, enum: ['design1', 'design2', 'design3', 'design4'], default: 'design1' },
  type: { type: String },
  rows: [LeaderboardRowSchema]
}, { _id: false });

const TVStateSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'Overall', 'Day 1', 'Custom', 'ALL_WINNERS'
  config: { type: mongoose.Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: false },
  leaderboardDesign: { type: String, default: 'design1' },
  allWinnersDesign: { type: String, default: 'design1' },
  resultsDesign: { type: String, default: 'design1' },
  finalRevealActive: { type: Boolean, default: false },
  finalRevealTeamName: { type: String, default: '' },
  finalRevealPosition: { type: Number, default: 1 },
  displayEnabled: { type: Boolean, default: true },
  presentationType: { type: String, default: null },
  presentationStartedAt: { type: Date, default: null },
  presentationExpiresAt: { type: Date, default: null },
  presentationDuration: { type: Number, default: null },
  presentationData: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

// Force recompilation of model in Next.js development
if (mongoose.models.TVState) {
  delete mongoose.models.TVState;
}

export const TVState = mongoose.model('TVState', TVStateSchema);
