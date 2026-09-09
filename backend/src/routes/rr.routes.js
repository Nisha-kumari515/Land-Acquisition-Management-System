import { Router } from 'express';
import * as rrController from '../controllers/rr.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/families', rrController.listFamilies);
router.get('/families/:id', rrController.getFamily);
router.post('/families', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'RR_OFFICER'), rrController.createFamily);
router.patch('/families/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'RR_OFFICER'), rrController.updateFamily);
router.post('/families/:familyId/entitlements', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'RR_OFFICER'), rrController.createEntitlement);
router.patch('/entitlements/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'RR_OFFICER'), rrController.updateEntitlement);

export default router;
