import Document from '../models/Document.js';
import DocumentVersion from '../models/DocumentVersion.js';
import Case from '../models/Case.js';
import { generateDocumentId } from '../utils/generateId.js';
import { hashFile, verifyIntegrity } from '../services/hashService.js';
import { uploadFile } from '../services/cloudinaryService.js';
import { classifyDocument, summarizeDocument, extractEntities, extractKeywords } from '../services/aiService.js';
import { extractTextFromBuffer } from '../services/ocrService.js';
import { logAuditEvent } from '../middleware/audit.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * @desc    List documents with filtering and pagination
 * @route   GET /api/documents
 * @access  Private
 */
export const listDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.caseId) query.caseId = req.query.caseId;
    if (req.query.type) query.type = req.query.type;
    if (req.query.securityLevel) query.securityLevel = req.query.securityLevel;
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // By default exclude archived unless specifically requested
      query.status = { $ne: 'archived' };
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { documentId: searchRegex },
        { ocrText: searchRegex },
        { aiSummary: searchRegex },
      ];
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('caseId', 'caseId title priority status')
        .populate('uploadedBy', 'name email role department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    return successResponse(
      res,
      'Documents retrieved successfully',
      documents,
      200,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload new document with SHA-256 computation, Cloudinary storage, OCR & AI analysis
 * @route   POST /api/documents/upload
 * @access  Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { caseId, name, type, securityLevel, metadata } = req.body;

    if (!req.file) {
      return errorResponse(res, 'No document file provided for upload', 400);
    }

    if (!caseId) {
      return errorResponse(res, 'Associated caseId is required', 400);
    }

    // Verify case existence
    const caseExists = await Case.findById(caseId);
    if (!caseExists) {
      return errorResponse(res, 'Associated case not found', 404);
    }

    const fileBuffer = req.file.buffer;
    const originalName = name || req.file.originalname;

    // 1. Compute SHA-256 hash immediately
    const sha256Hash = hashFile(fileBuffer);

    // 2. Upload to Cloudinary (or demo fallback)
    const uploadResult = await uploadFile(fileBuffer, {
      filename: req.file.originalname,
      resourceType: 'auto',
    });

    // 3. OCR text extraction
    const ocrText = await extractTextFromBuffer(fileBuffer, req.file.mimetype, req.file.originalname);

    // 4. AI classification, summarization, entity & keyword extraction
    const classification = await classifyDocument(ocrText, originalName);
    const summaryData = await summarizeDocument(ocrText, originalName);
    const entities = await extractEntities(ocrText);
    const keywords = await extractKeywords(ocrText);

    const docType = type || classification.type || 'other';
    const documentId = generateDocumentId();

    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (e) {
        parsedMetadata = { notes: metadata };
      }
    }

    // 5. Persist document
    const newDoc = new Document({
      documentId,
      caseId: caseExists._id,
      name: originalName,
      type: docType,
      securityLevel: securityLevel || 'internal',
      fileUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      mimeType: req.file.mimetype,
      size: req.file.size,
      sha256Hash,
      version: 1,
      status: 'verified',
      uploadedBy: req.user._id,
      ocrText,
      aiSummary: summaryData.summary,
      aiClassification: {
        type: classification.type,
        confidence: classification.confidence,
        entities,
        keywords,
      },
      metadata: {
        ...parsedMetadata,
        originalFilename: req.file.originalname,
      },
    });

    await newDoc.save();

    // 6. Record Initial Version in DocumentVersion
    const initialVersion = new DocumentVersion({
      documentId: newDoc._id,
      versionNumber: 1,
      fileUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      sha256Hash,
      size: req.file.size,
      createdBy: req.user._id,
      changeDescription: 'Initial document ingest and cryptographic notarization',
    });
    await initialVersion.save();

    // 7. Audit log event
    await logAuditEvent({
      req,
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'document',
      resourceId: newDoc.documentId,
      details: `Document uploaded: "${newDoc.name}" (${newDoc.documentId}) with SHA-256 hash: ${sha256Hash.substring(0, 16)}...`,
      status: 'success',
      metadata: {
        sha256Hash,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    const populatedDoc = await Document.findById(newDoc._id)
      .populate('caseId', 'caseId title priority status')
      .populate('uploadedBy', 'name email role department');

    return successResponse(res, 'Document uploaded and analyzed successfully', populatedDoc, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document details by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('caseId', 'caseId title priority status')
      .populate('uploadedBy', 'name email role department');

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    await logAuditEvent({
      req,
      action: 'DOCUMENT_VIEWED',
      resourceType: 'document',
      resourceId: document.documentId,
      details: `Document viewed: ${document.documentId} by ${req.user.name}`,
      status: 'success',
    });

    return successResponse(res, 'Document retrieved successfully', document);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update document metadata
 * @route   PUT /api/documents/:id
 * @access  Private
 */
export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, securityLevel, status, metadata } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    if (name) document.name = name;
    if (type) document.type = type;
    if (securityLevel) document.securityLevel = securityLevel;
    if (status) document.status = status;
    if (metadata) {
      document.metadata = {
        ...document.metadata,
        ...metadata,
      };
    }

    await document.save();

    await logAuditEvent({
      req,
      action: 'DOCUMENT_UPDATED',
      resourceType: 'document',
      resourceId: document.documentId,
      details: `Document metadata updated: ${document.documentId} by ${req.user.name}`,
      status: 'success',
    });

    const updatedDoc = await Document.findById(document._id)
      .populate('caseId', 'caseId title priority status')
      .populate('uploadedBy', 'name email role department');

    return successResponse(res, 'Document updated successfully', updatedDoc);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete / archive document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    document.status = 'archived';
    await document.save();

    await logAuditEvent({
      req,
      action: 'DOCUMENT_DELETED',
      resourceType: 'document',
      resourceId: document.documentId,
      details: `Document archived/deleted: ${document.documentId} by ${req.user.name}`,
      status: 'success',
    });

    return successResponse(res, 'Document archived successfully', {
      id: document._id,
      documentId: document.documentId,
      status: document.status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document integrity information
 * @route   GET /api/documents/:id/integrity
 * @access  Private
 */
export const getDocumentIntegrity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .select('documentId name sha256Hash version status updatedAt createdAt');

    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const versionCount = await DocumentVersion.countDocuments({ documentId: document._id });

    return successResponse(res, 'Integrity benchmark retrieved', {
      documentId: document._id,
      documentIdentifier: document.documentId,
      name: document.name,
      sha256Hash: document.sha256Hash,
      version: document.version,
      totalVersions: versionCount,
      status: document.status,
      lastCertifiedAt: document.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Re-hash and compare document integrity
 * @route   POST /api/documents/:id/verify-integrity
 * @access  Private
 */
export const verifyDocumentIntegrity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await verifyIntegrity(id);

    const auditActionName = result.isValid ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_FAILED';
    await logAuditEvent({
      req,
      action: auditActionName,
      resourceType: 'document',
      resourceId: result.documentIdentifier,
      details: `Integrity check: ${result.message} (Stored: ${result.storedHash.substring(0, 10)}... | Computed: ${result.computedHash.substring(0, 10)}...)`,
      status: result.isValid ? 'success' : 'failure',
      metadata: {
        isValid: result.isValid,
        storedHash: result.storedHash,
        computedHash: result.computedHash,
      },
    });

    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get document version history
 * @route   GET /api/documents/:id/versions
 * @access  Private
 */
export const getDocumentVersions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const versions = await DocumentVersion.find({ documentId: document._id })
      .populate('createdBy', 'name email role')
      .sort({ versionNumber: -1 });

    return successResponse(res, 'Version history retrieved successfully', {
      documentId: document.documentId,
      currentVersion: document.version,
      versions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new document version
 * @route   POST /api/documents/:id/versions
 * @access  Private
 */
export const createDocumentVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { changeDescription } = req.body;

    if (!req.file) {
      return errorResponse(res, 'New version file is required', 400);
    }

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const fileBuffer = req.file.buffer;
    const newHash = hashFile(fileBuffer);
    const nextVersionNumber = document.version + 1;

    // Upload new version file
    const uploadResult = await uploadFile(fileBuffer, {
      filename: `${document.name}_v${nextVersionNumber}`,
      resourceType: 'auto',
    });

    // Create version record
    const versionRecord = new DocumentVersion({
      documentId: document._id,
      versionNumber: nextVersionNumber,
      fileUrl: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      sha256Hash: newHash,
      size: req.file.size,
      createdBy: req.user._id,
      changeDescription: changeDescription || `Version ${nextVersionNumber} updated by ${req.user.name}`,
    });

    await versionRecord.save();

    // Update main document pointer
    document.version = nextVersionNumber;
    document.fileUrl = uploadResult.url;
    document.cloudinaryPublicId = uploadResult.publicId;
    document.sha256Hash = newHash;
    document.size = req.file.size;
    document.mimeType = req.file.mimetype;
    document.status = 'verified';

    // Refresh OCR and AI analysis on new version content
    const ocrText = await extractTextFromBuffer(fileBuffer, req.file.mimetype, req.file.originalname);
    if (ocrText) {
      document.ocrText = ocrText;
      const summaryResult = await summarizeDocument(ocrText, document.name);
      document.aiSummary = summaryResult.summary;
    }

    await document.save();

    await logAuditEvent({
      req,
      action: 'DOCUMENT_VERSION_CREATED',
      resourceType: 'document',
      resourceId: document.documentId,
      details: `New version (v${nextVersionNumber}) created for ${document.documentId} with hash ${newHash.substring(0, 16)}...`,
      status: 'success',
      metadata: {
        versionNumber: nextVersionNumber,
        newHash,
      },
    });

    return successResponse(res, `Version ${nextVersionNumber} created successfully`, {
      document,
      version: versionRecord,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run comprehensive AI analysis on document
 * @route   POST /api/documents/:id/analyze
 * @access  Private
 */
export const analyzeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const text = document.ocrText || document.name;
    const [classification, summaryData, entities, keywords] = await Promise.all([
      classifyDocument(text, document.name),
      summarizeDocument(text, document.name),
      extractEntities(text),
      extractKeywords(text),
    ]);

    document.aiSummary = summaryData.summary;
    document.aiClassification = {
      type: classification.type,
      confidence: classification.confidence,
      entities,
      keywords,
    };
    if (document.type === 'other') {
      document.type = classification.type;
    }

    await document.save();

    await logAuditEvent({
      req,
      action: 'AI_ANALYSIS_REQUESTED',
      resourceType: 'document',
      resourceId: document.documentId,
      details: `AI analysis performed on ${document.documentId}: Type=${classification.type} (${classification.confidence * 100}%)`,
      status: 'success',
    });

    return successResponse(res, 'AI analysis executed successfully', {
      documentId: document.documentId,
      classification,
      summary: summaryData,
      entities,
      keywords,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI summary for document
 * @route   POST /api/documents/:id/summarize
 * @access  Private
 */
export const summarizeDocumentEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const text = document.ocrText || document.name;
    const summaryData = await summarizeDocument(text, document.name);

    document.aiSummary = summaryData.summary;
    await document.save();

    return successResponse(res, 'Summary generated successfully', summaryData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Classify document type using AI
 * @route   POST /api/documents/:id/classify
 * @access  Private
 */
export const classifyDocumentEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }

    const text = document.ocrText || document.name;
    const classification = await classifyDocument(text, document.name);

    document.type = classification.type;
    document.aiClassification = {
      ...document.aiClassification,
      type: classification.type,
      confidence: classification.confidence,
    };
    await document.save();

    return successResponse(res, 'Classification complete', classification);
  } catch (error) {
    next(error);
  }
};

export default {
  listDocuments,
  uploadDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentIntegrity,
  verifyDocumentIntegrity,
  getDocumentVersions,
  createDocumentVersion,
  analyzeDocument,
  summarizeDocumentEndpoint,
  classifyDocumentEndpoint,
};
