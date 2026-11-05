import Document from '../models/Document.js';
import Case from '../models/Case.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { successResponse } from '../utils/responseHelper.js';

/**
 * @desc    Get dashboard analytics and statistical summaries
 * @route   GET /api/analytics
 * @access  Private
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCases,
      totalDocuments,
      totalAuditLogs,
      docsByType,
      docsBySecurity,
      docsByStatus,
      casesByStatus,
      casesByPriority,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      Case.countDocuments(),
      Document.countDocuments({ status: { $ne: 'archived' } }),
      AuditLog.countDocuments(),

      // Documents aggregated by type
      Document.aggregate([
        { $match: { status: { $ne: 'archived' } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Documents aggregated by securityLevel
      Document.aggregate([
        { $match: { status: { $ne: 'archived' } } },
        { $group: { _id: '$securityLevel', count: { $sum: 1 } } },
      ]),

      // Documents aggregated by status
      Document.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Cases aggregated by status
      Case.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Cases aggregated by priority
      Case.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // 10 most recent audit logs
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Calculate integrity integrity index (percentage of verified documents)
    const verifiedCount = docsByStatus.find((d) => d._id === 'verified')?.count || 0;
    const integrityScore = totalDocuments > 0 ? Math.round((verifiedCount / totalDocuments) * 100) : 100;

    const stats = {
      overview: {
        totalUsers,
        totalCases,
        totalDocuments,
        totalAuditLogs,
        integrityScore: `${integrityScore}%`,
      },
      documents: {
        byType: docsByType.map((item) => ({ type: item._id, count: item.count })),
        bySecurityLevel: docsBySecurity.map((item) => ({ level: item._id, count: item.count })),
        byStatus: docsByStatus.map((item) => ({ status: item._id, count: item.count })),
      },
      cases: {
        byStatus: casesByStatus.map((item) => ({ status: item._id, count: item.count })),
        byPriority: casesByPriority.map((item) => ({ priority: item._id, count: item.count })),
      },
      recentActivity,
    };

    return successResponse(res, 'Analytics summary retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardAnalytics,
};
