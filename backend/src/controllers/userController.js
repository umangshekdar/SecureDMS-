import User from '../models/User.js';
import { logAuditEvent } from '../middleware/audit.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    List users with pagination and search
 * @route   GET /api/users
 * @access  Admin
 */
export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { department: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return successResponse(
      res,
      'Users retrieved successfully',
      users,
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
 * @desc    Create a new user by Admin
 * @route   POST /api/users
 * @access  Admin
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, status } = req.body;

    if (!name || !email || !password || !role) {
      return errorResponse(res, 'Name, email, password, and role are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      department: department || 'General Investigations',
      status: status || 'active',
    });

    await user.save();

    await logAuditEvent({
      req,
      action: 'USER_CREATED',
      resourceType: 'user',
      resourceId: user._id,
      details: `Admin ${req.user.name} created user ${user.name} with role ${user.role}`,
      status: 'success',
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return successResponse(res, 'User created successfully', userObj, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 * @access  Admin (or self profile update)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Role updates can only be executed by Admin
    if (role && req.user.role !== 'admin' && role !== user.role) {
      return errorResponse(res, 'Only administrators can modify user roles', 403);
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role && req.user.role === 'admin') {
      if (user.role !== role) {
        await logAuditEvent({
          req,
          action: 'PERMISSION_CHANGED',
          resourceType: 'user',
          resourceId: user._id,
          details: `Role changed from ${user.role} to ${role} for user ${user.name}`,
          status: 'success',
        });
      }
      user.role = role;
    }
    if (department) user.department = department;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    await logAuditEvent({
      req,
      action: 'USER_UPDATED',
      resourceType: 'user',
      resourceId: user._id,
      details: `User ${user.name} was updated by ${req.user.name}`,
      status: 'success',
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return successResponse(res, 'User updated successfully', userObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user status (active, inactive, suspended)
 * @route   PATCH /api/users/:id/status
 * @access  Admin
 */
export const changeUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be active, inactive, or suspended', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    await logAuditEvent({
      req,
      action: 'USER_UPDATED',
      resourceType: 'user',
      resourceId: user._id,
      details: `User status changed from ${oldStatus} to ${status} for ${user.name}`,
      status: 'success',
    });

    return successResponse(res, `User status updated to ${status}`, {
      id: user._id,
      status: user.status,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listUsers,
  createUser,
  updateUser,
  changeUserStatus,
};
