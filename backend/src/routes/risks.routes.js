import { Router } from 'express';
import * as riskController from '../controllers/risk.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', riskController.listRisks);
router.get('/projects/:projectId', riskController.getProjectRisks);
router.post('/evaluate', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER'), riskController.evaluateParcel);
router.post('/project-parcels/:projectParcelId/evaluate', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER'), riskController.evaluateParcel);

export default router;
