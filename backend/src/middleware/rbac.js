import { errorResponse } from '../utils/responseHelper.js';

/**
 * Role-Based Access Control (RBAC) middleware.
 * Restricts route access to specified roles.
 * Allowed roles: 'admin', 'investigator', 'forensic', 'legal'
 * 
 * @param  {...string} roles Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User identity not established.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
};

export default {
  authorize,
};
