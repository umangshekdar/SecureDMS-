import express from 'express';
import {
  listUsers,
  createUser,
  updateUser,
  changeUserStatus,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// Require authentication for all user routes
router.use(authenticate);

// Admin-restricted routes
router.get('/', authorize('admin'), listUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id', validateObjectId('id'), updateUser);
router.patch('/:id/status', authorize('admin'), validateObjectId('id'), changeUserStatus);

export default router;
