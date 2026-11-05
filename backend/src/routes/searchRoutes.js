import express from 'express';
import { searchDocuments } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', searchDocuments);

export default router;
