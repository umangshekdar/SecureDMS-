import mongoose from 'mongoose';

/**
 * AuditLog Schema for immutable security and audit trails.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: 'Anonymous',
    },
    userRole: {
      type: String,
      default: 'guest',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'DOCUMENT_UPLOADED',
        'DOCUMENT_VIEWED',
        'DOCUMENT_DOWNLOADED',
        'DOCUMENT_UPDATED',
        'DOCUMENT_DELETED',
        'DOCUMENT_VERSION_CREATED',
        'INTEGRITY_VERIFIED',
        'INTEGRITY_FAILED',
        'CASE_CREATED',
        'CASE_UPDATED',
        'CASE_VIEWED',
        'USER_CREATED',
        'USER_UPDATED',
        'PERMISSION_CHANGED',
        'SEARCH_PERFORMED',
        'AI_ANALYSIS_REQUESTED',
      ],
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['document', 'case', 'user', 'system'],
      default: 'system',
      index: true,
    },
    resourceId: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
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

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
