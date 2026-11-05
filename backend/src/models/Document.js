import mongoose from 'mongoose';

/**
 * Document Schema representing an evidence/legal document within a case.
 */
const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: [true, 'Document ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Associated Case is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'fir',
        'investigation-report',
        'witness-statement',
        'forensic-report',
        'evidence-record',
        'charge-sheet',
        'legal-notice',
        'court-filing',
        'judgment',
        'other',
      ],
      default: 'other',
    },
    securityLevel: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'highly-confidential'],
      default: 'internal',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
    size: {
      type: Number,
      default: 0,
    },
    sha256Hash: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['processing', 'processed', 'verified', 'review-required', 'archived'],
      default: 'processing',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ocrText: {
      type: String,
      default: '',
    },
    aiSummary: {
      type: String,
      default: '',
    },
    aiClassification: {
      type: {
        type: String,
        default: '',
      },
      confidence: {
        type: Number,
        default: 0,
      },
      entities: {
        type: [String],
        default: [],
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index across name, ocrText, and aiSummary
documentSchema.index({ name: 'text', ocrText: 'text', aiSummary: 'text' });

const Document = mongoose.model('Document', documentSchema);

export default Document;
