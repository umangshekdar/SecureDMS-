import AuditLog from '../models/AuditLog.js';

/**
 * Creates an immutable audit log entry in the database.
 * @param {object} params
 * @param {import('express').Request} [params.req]
 * @param {string} params.action
 * @param {'document'|'case'|'user'|'system'} [params.resourceType]
 * @param {string} [params.resourceId]
 * @param {string} [params.details]
 * @param {'success'|'failure'} [params.status]
 * @param {object} [params.metadata]
 * @param {object} [params.user]
 */
export const logAuditEvent = async ({
  req = null,
  action,
  resourceType = 'system',
  resourceId = '',
  details = '',
  status = 'success',
  metadata = {},
  user = null,
}) => {
  try {
    const activeUser = user || (req ? req.user : null);
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1'
      : '127.0.0.1';

    const auditEntry = new AuditLog({
      userId: activeUser ? activeUser._id : null,
      userName: activeUser ? activeUser.name : 'System/Anonymous',
      userRole: activeUser ? activeUser.role : 'system',
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : '',
      details,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : String(ipAddress),
      status,
      metadata,
    });

    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    // Non-blocking error handling for audit log writes to avoid halting main transaction
    console.error('[Audit Logger Error] Failed to persist audit event:', error.message);
    return null;
  }
};

/**
 * Express middleware to automatically log audit trail after response finishes.
 * @param {string} action 
 * @param {'document'|'case'|'user'|'system'} resourceType 
 */
export const auditAction = (action, resourceType = 'system') => {
  return (req, res, next) => {
    res.on('finish', () => {
      // Only log if response was successful
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';
      const resourceId = req.params?.id || req.body?.caseId || req.body?.documentId || '';
      
      logAuditEvent({
        req,
        action,
        resourceType,
        resourceId,
        details: `${req.method} ${req.originalUrl} responded with status ${res.statusCode}`,
        status,
        metadata: {
          statusCode: res.statusCode,
          route: req.originalUrl,
          method: req.method,
        },
      });
    });

    next();
  };
};

export default {
  logAuditEvent,
  auditAction,
};
