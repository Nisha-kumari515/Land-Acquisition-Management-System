import { Router } from 'express';
import * as integrationController from '../controllers/integration.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', integrationController.listIntegrations);
router.post('/assam/sync', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), integrationController.syncAssam);
router.get('/assam/status', integrationController.getAssamStatus);
router.get('/sync-logs', integrationController.listAllSyncLogs);
router.get('/sync-logs/:id', integrationController.getSyncLog);
router.get('/:id', integrationController.getIntegration);
router.post('/', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), integrationController.createIntegration);
router.get('/:id/sync-logs', integrationController.listSyncLogs);
router.post('/:id/sync', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), integrationController.syncIntegration);

export default router;
