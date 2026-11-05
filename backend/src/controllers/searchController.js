import Document from '../models/Document.js';
import Case from '../models/Case.js';
import { logAuditEvent } from '../middleware/audit.js';
import { successResponse } from '../utils/responseHelper.js';

/**
 * @desc    Full-text search across documents and associated cases
 * @route   GET /api/search
 * @access  Private
 */
export const searchDocuments = async (req, res, next) => {
  try {
    const { q, type, case: caseFilter, level, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by type
    if (type) query.type = type;

    // Filter by security level
    if (level) query.securityLevel = level;

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'archived' };
    }

    // Filter by Case (ObjectId or Case ID like CASE-YYYY-NNNNN)
    if (caseFilter) {
      if (/^[0-9a-fA-F]{24}$/.test(caseFilter)) {
        query.caseId = caseFilter;
      } else {
        const foundCase = await Case.findOne({ caseId: caseFilter });
        if (foundCase) {
          query.caseId = foundCase._id;
        }
      }
    }

    // Query text search
    if (q && q.trim()) {
      const searchTerms = q.trim();
      const regex = new RegExp(searchTerms, 'i');
      query.$or = [
        { name: regex },
        { documentId: regex },
        { ocrText: regex },
        { aiSummary: regex },
        { 'aiClassification.keywords': regex },
        { 'aiClassification.entities': regex },
      ];
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('caseId', 'caseId title priority status')
        .populate('uploadedBy', 'name email role department')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    // Record search audit log
    await logAuditEvent({
      req,
      action: 'SEARCH_PERFORMED',
      resourceType: 'system',
      details: `Search executed query: "${q || '*'}" (matched ${total} records)`,
      status: 'success',
      metadata: {
        query: q || '',
        filters: { type, level, status, caseFilter },
        resultCount: total,
      },
    });

    return successResponse(
      res,
      'Search results retrieved successfully',
      documents,
      200,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query: q || '',
      }
    );
  } catch (error) {
    next(error);
  }
};

export default {
  searchDocuments,
};
