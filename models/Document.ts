import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  filePath: string;
  extractedText: string;
  pageCount?: number;
  wordCount?: number;
  description?: string;
  qaPairs?: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx'],
    required: [true, 'File type is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true,
  },
  extractedText: {
    type: String,
    required: [true, 'Extracted text is required'],
  },
  pageCount: {
    type: Number,
  },
  wordCount: {
    type: Number,
  },
  description: {
    type: String,
    trim: true,
  },
  qaPairs: [{
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  }],
}, {
  timestamps: true,
});

// Create compound index for efficient queries
DocumentSchema.index({ userId: 1, fileName: 1 }, { unique: true });

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

