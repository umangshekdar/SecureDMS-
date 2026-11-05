import Case from '../models/Case.js';
import Document from '../models/Document.js';
import { generateCaseId } from '../utils/generateId.js';
import { logAuditEvent } from '../middleware/audit.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * @desc    List cases (filtered by role/assignment)
 * @route   GET /api/cases
 * @access  Private
 */
export const listCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by role: Admins can see all cases. Other roles see cases they are assigned to, created, or all if none assigned
    if (req.user.role !== 'admin') {
      query.$or = [
        { assignedUsers: req.user._id },
        { createdBy: req.user._id },
      ];
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.caseType) query.caseType = req.query.caseType;

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { caseId: searchRegex },
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions },
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate('assignedUsers', 'name email role department')
        .populate('createdBy', 'name email role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Case.countDocuments(query),
    ]);

    return successResponse(
      res,
      'Cases retrieved successfully',
      cases,
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
 * @desc    Create a new case
 * @route   POST /api/cases
 * @access  Investigator, Admin
 */
export const createCase = async (req, res, next) => {
  try {
    const { title, description, caseType, priority, assignedUsers } = req.body;

    if (!title) {
      return errorResponse(res, 'Case title is required', 400);
    }

    const caseId = generateCaseId();

    const newCase = new Case({
      caseId,
      title,
      description: description || '',
      caseType: caseType || 'criminal',
      priority: priority || 'medium',
      status: 'open',
      assignedUsers: assignedUsers && Array.isArray(assignedUsers) ? assignedUsers : [req.user._id],
      createdBy: req.user._id,
    });

    await newCase.save();

    await logAuditEvent({
      req,
      action: 'CASE_CREATED',
      resourceType: 'case',
      resourceId: newCase.caseId,
      details: `Case created: "${newCase.title}" (${newCase.caseId}) by ${req.user.name}`,
      status: 'success',
    });

    const populatedCase = await Case.findById(newCase._id)
      .populate('assignedUsers', 'name email role department')
      .populate('createdBy', 'name email role');

    return successResponse(res, 'Case created successfully', populatedCase, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get case details by ID
 * @route   GET /api/cases/:id
 * @access  Private
 */
export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const caseItem = await Case.findById(id)
      .populate('assignedUsers', 'name email role department')
      .populate('createdBy', 'name email role');

    if (!caseItem) {
      return errorResponse(res, 'Case not found', 404);
    }

    // Fetch related documents count and brief document list
    const documents = await Document.find({ caseId: caseItem._id })
      .select('documentId name type securityLevel size status createdAt')
      .sort({ createdAt: -1 });

    await logAuditEvent({
      req,
      action: 'CASE_VIEWED',
      resourceType: 'case',
      resourceId: caseItem.caseId,
      details: `Case viewed: ${caseItem.caseId} by ${req.user.name}`,
      status: 'success',
    });

    return successResponse(res, 'Case details retrieved successfully', {
      case: caseItem,
      documents,
      documentCount: documents.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update case details
 * @route   PUT /api/cases/:id
 * @access  Private
 */
export const updateCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, caseType, priority, status, assignedUsers } = req.body;

    const caseItem = await Case.findById(id);
    if (!caseItem) {
      return errorResponse(res, 'Case not found', 404);
    }

    if (title) caseItem.title = title;
    if (description !== undefined) caseItem.description = description;
    if (caseType) caseItem.caseType = caseType;
    if (priority) caseItem.priority = priority;
    if (status) caseItem.status = status;
    if (assignedUsers && Array.isArray(assignedUsers)) caseItem.assignedUsers = assignedUsers;

    await caseItem.save();

    await logAuditEvent({
      req,
      action: 'CASE_UPDATED',
      resourceType: 'case',
      resourceId: caseItem.caseId,
      details: `Case updated: ${caseItem.caseId} by ${req.user.name}`,
      status: 'success',
    });

    const updatedCase = await Case.findById(caseItem._id)
      .populate('assignedUsers', 'name email role department')
      .populate('createdBy', 'name email role');

    return successResponse(res, 'Case updated successfully', updatedCase);
  } catch (error) {
    next(error);
  }
};

export default {
  listCases,
  createCase,
  getCaseById,
  updateCase,
};
