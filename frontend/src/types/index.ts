export type UserRole = 'admin' | 'investigator' | 'forensic' | 'legal';
export type CaseStatus = 'open' | 'active' | 'under-review' | 'closed' | 'archived';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseType = 'financial' | 'criminal' | 'civil' | 'cybercrime' | 'forensic' | 'administrative' | 'other';
export type DocumentType = 'fir' | 'investigation-report' | 'witness-statement' | 'forensic-report' | 'evidence-record' | 'charge-sheet' | 'legal-notice' | 'court-filing' | 'judgment' | 'other';
export type SecurityLevel = 'public' | 'internal' | 'confidential' | 'highly-confidential';
export type DocumentStatus = 'processing' | 'processed' | 'verified' | 'review-required' | 'archived';
export type AuditAction = 
  | 'USER_LOGIN' 
  | 'USER_LOGOUT' 
  | 'DOCUMENT_UPLOADED' 
  | 'DOCUMENT_VIEWED' 
  | 'DOCUMENT_DOWNLOADED' 
  | 'DOCUMENT_UPDATED' 
  | 'DOCUMENT_DELETED' 
  | 'DOCUMENT_VERSION_CREATED' 
  | 'INTEGRITY_VERIFIED' 
  | 'INTEGRITY_FAILED' 
  | 'CASE_CREATED' 
  | 'CASE_UPDATED' 
  | 'CASE_VIEWED' 
  | 'USER_CREATED' 
  | 'USER_UPDATED' 
  | 'PERMISSION_CHANGED' 
  | 'SEARCH_PERFORMED' 
  | 'AI_ANALYSIS_REQUESTED';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  caseType: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  assignedUsers: User[] | string[];
  createdBy: User | string;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  documentId: string;
  caseId: Case | string;
  name: string;
  type: DocumentType;
  securityLevel: SecurityLevel;
  fileUrl: string;
  cloudinaryPublicId?: string;
  mimeType: string;
  size: number;
  sha256Hash: string;
  version: number;
  status: DocumentStatus;
  uploadedBy: User | string;
  ocrText?: string;
  aiSummary?: string;
  aiClassification?: {
    type: string;
    confidence: number;
    entities: Array<{ label: string; value: string }>;
    keywords: string[];
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  _id: string;
  documentId: string;
  versionNumber: number;
  fileUrl: string;
  sha256Hash: string;
  size: number;
  createdBy: User | string;
  changeDescription: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Analytics {
  totalCases: number;
  totalDocuments: number;
  documentsProcessed: number;
  integrityVerified: number;
  pendingReview: number;
  recentActivity: AuditLog[];
  documentsByType: Array<{ type: string; count: number }>;
  documentsByCase: Array<{ caseId: string; title: string; count: number }>;
  documentsBySecurityLevel: Array<{ level: string; count: number }>;
  documentsByStatus: Array<{ status: string; count: number }>;
  uploadActivity: Array<{ date: string; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IntegrityResult {
  verified: boolean;
  storedHash: string;
  currentHash: string;
  documentId: string;
  verifiedAt: string;
  message: string;
}
