import express from 'express';
import {
  listCases,
  createCase,
  getCaseById,
  updateCase,
} from '../controllers/caseController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listCases);
router.post('/', authorize('admin', 'investigator'), createCase);
router.get('/:id', validateObjectId('id'), getCaseById);
router.put('/:id', validateObjectId('id'), updateCase);

export default router;
