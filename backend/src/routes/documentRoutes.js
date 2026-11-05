import express from 'express';
import {
  listDocuments,
  uploadDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentIntegrity,
  verifyDocumentIntegrity,
  getDocumentVersions,
  createDocumentVersion,
  analyzeDocument,
  summarizeDocumentEndpoint,
  classifyDocumentEndpoint,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateObjectId } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

// Document collection routes
router.get('/', listDocuments);
router.post('/upload', upload.single('file'), uploadDocument);

// Individual document endpoints
router.get('/:id', validateObjectId('id'), getDocumentById);
router.put('/:id', validateObjectId('id'), updateDocument);
router.delete('/:id', validateObjectId('id'), deleteDocument);

// Cryptographic integrity endpoints
router.get('/:id/integrity', validateObjectId('id'), getDocumentIntegrity);
router.post('/:id/verify-integrity', validateObjectId('id'), verifyDocumentIntegrity);

// Document Versioning endpoints
router.get('/:id/versions', validateObjectId('id'), getDocumentVersions);
router.post('/:id/versions', validateObjectId('id'), upload.single('file'), createDocumentVersion);

// AI processing & NLP endpoints
router.post('/:id/analyze', validateObjectId('id'), analyzeDocument);
router.post('/:id/summarize', validateObjectId('id'), summarizeDocumentEndpoint);
router.post('/:id/classify', validateObjectId('id'), classifyDocumentEndpoint);

export default router;
