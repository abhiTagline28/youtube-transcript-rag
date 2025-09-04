import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  transcript: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  videoId: {
    type: String,
    required: [true, 'Video ID is required'],
    trim: true,
  },
  videoTitle: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true,
  },
  thumbnailUrl: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
  },
  transcript: {
    type: String,
    required: [true, 'Transcript is required'],
  },
}, {
  timestamps: true,
});

// Create compound index for efficient queries
VideoSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
