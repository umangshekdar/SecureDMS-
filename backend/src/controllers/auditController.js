import AuditLog from '../models/AuditLog.js';
import { successResponse } from '../utils/responseHelper.js';

/**
 * @desc    Get audit trail logs with filtering and pagination
 * @route   GET /api/audit-logs
 * @access  Private (Admins see all; other roles see their own activities)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Non-admin users are restricted to viewing their own audit actions
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.action) query.action = req.query.action;
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.status) query.status = req.query.status;

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { userName: searchRegex },
        { action: searchRegex },
        { resourceId: searchRegex },
        { details: searchRegex },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return successResponse(
      res,
      'Audit logs retrieved successfully',
      logs,
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

export default {
  getAuditLogs,
};
