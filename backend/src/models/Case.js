import mongoose from 'mongoose';

/**
 * Case Schema representing an investigative or legal case containing documents.
 */
const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: [true, 'Case ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    caseType: {
      type: String,
      enum: ['financial', 'criminal', 'civil', 'cybercrime', 'forensic', 'administrative', 'other'],
      default: 'criminal',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'active', 'under-review', 'closed', 'archived'],
      default: 'open',
    },
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search & query performance
caseSchema.index({ title: 'text', description: 'text' });

const Case = mongoose.model('Case', caseSchema);

export default Case;
