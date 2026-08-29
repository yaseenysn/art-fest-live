import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  storageKey: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: null,
  }
}, { timestamps: true });

if (mongoose.models.Media) {
  delete mongoose.models.Media;
}

export const Media = mongoose.model('Media', MediaSchema);
