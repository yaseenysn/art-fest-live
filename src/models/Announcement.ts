import { Schema, models, model } from 'mongoose';
import { IAnnouncement } from '../types';

const AnnouncementSchema = new Schema<IAnnouncement>({
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  duration: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
});

export const Announcement = models.Announcement || model<IAnnouncement>('Announcement', AnnouncementSchema);
