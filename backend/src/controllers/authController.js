import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * @desc    Authenticate user and return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await logAuditEvent({
        req,
        action: 'USER_LOGIN',
        resourceType: 'user',
        details: `Failed login attempt for non-existent email: ${email}`,
        status: 'failure',
      });
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (user.status !== 'active') {
      await logAuditEvent({
        req,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user._id,
        user,
        details: `Login attempt for ${user.status} account: ${email}`,
        status: 'failure',
      });
      return errorResponse(res, `Account is ${user.status}. Please contact an administrator.`, 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAuditEvent({
        req,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user._id,
        user,
        details: `Failed login password attempt for user: ${email}`,
        status: 'failure',
      });
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    await logAuditEvent({
      req,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: user._id,
      user,
      details: `Successful login for user ${user.name} (${user.role})`,
      status: 'success',
    });

    return successResponse(res, 'Authentication successful', {
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (or Admin in restricted environments)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'A user with this email address already exists', 400);
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Pre-save hook hashes this
      role: role || 'investigator',
      department: department || 'General Investigations',
    });

    await user.save();

    await logAuditEvent({
      req,
      action: 'USER_CREATED',
      resourceType: 'user',
      resourceId: user._id,
      user: req.user || user,
      details: `User account created: ${user.name} (${user.email}) with role ${user.role}`,
      status: 'success',
    });

    const token = generateToken(user._id, user.role);

    return successResponse(
      res,
      'User registered successfully',
      {
        token,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user info
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }
    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj._id = user._id;
    userObj.id = user._id;

    // Return in standardized format supporting both flat user object and nested { user } shape
    return successResponse(res, 'Current user profile retrieved', {
      ...userObj,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user and record audit event
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAuditEvent({
        req,
        action: 'USER_LOGOUT',
        resourceType: 'user',
        resourceId: req.user._id,
        user: req.user,
        details: `User logged out: ${req.user.name}`,
        status: 'success',
      });
    }

    return successResponse(res, 'User successfully logged out');
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  register,
  getMe,
  logout,
};
