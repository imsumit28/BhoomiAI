import { Router } from 'express';
import { login, quickDemoLogin, getMe, listUsers } from '../controllers/authController';
import { uploadDocument, getDocumentById, listDocuments, triggerPipeline } from '../controllers/documentController';
import { searchLandRecords, getLandRecordById, updateRecordField, exportRecords } from '../controllers/landRecordController';
import { validateRecordManually, getValidationResult, listValidationResults, getCrossRecordConflicts } from '../controllers/validationController';
import { getVerificationQueue, getVerificationTaskById, completeVerification } from '../controllers/verificationController';
import { listAuditLogs } from '../controllers/auditController';
import { getDashboardStats, getLearningLoopMetrics } from '../controllers/analyticsController';
import { getMasterHierarchy, getSampleDocuments } from '../controllers/masterDataController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public / Auth routes
router.post('/auth/login', login);
router.post('/auth/quick-demo', quickDemoLogin);
router.get('/auth/me', authenticate, getMe);
router.get('/auth/users', authenticate, listUsers);

// Master Data & Samples
router.get('/master-data/hierarchy', getMasterHierarchy);
router.get('/master-data/samples', getSampleDocuments);

// Document Management & Pipeline
router.post('/documents/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/documents', authenticate, listDocuments);
router.get('/documents/:id', authenticate, getDocumentById);
router.post('/documents/:id/process', authenticate, triggerPipeline);

// Land Records Management
router.get('/land-records/search', authenticate, searchLandRecords);
router.get('/land-records/export', authenticate, exportRecords);
router.get('/land-records/:id', authenticate, getLandRecordById);
router.patch('/land-records/:id/field', authenticate, updateRecordField);

// Validation Engine
router.post('/land-records/:id/validate', authenticate, validateRecordManually);
router.get('/validations/conflicts', authenticate, getCrossRecordConflicts);
router.get('/validations/:id', authenticate, getValidationResult);
router.get('/validations', authenticate, listValidationResults);

// Verification Queue & Human-in-the-loop
router.get('/verification/queue', authenticate, getVerificationQueue);
router.get('/verification/tasks/:id', authenticate, getVerificationTaskById);
router.post('/verification/tasks/:id/resolve', authenticate, completeVerification);

// Audit Logs
router.get('/audit/logs', authenticate, listAuditLogs);

// Analytics & Learning Loop
router.get('/analytics/dashboard', authenticate, getDashboardStats);
router.get('/analytics/learning-loop', authenticate, getLearningLoopMetrics);

export default router;
