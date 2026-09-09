import { Router } from 'express';
import * as compensationController from '../controllers/compensation.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:acquisitionCaseId', compensationController.getByCase);
router.post('/:acquisitionCaseId', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FINANCE_OFFICER'), compensationController.create);
router.patch('/:acquisitionCaseId', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FINANCE_OFFICER'), compensationController.update);

export default router;
