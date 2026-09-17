import { Router } from 'express';
import { checkParcel, checkSource, getIssues } from '../controllers/data-quality.controller.js';
import { getQualityDashboard } from '../controllers/data-quality-dashboard.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/dashboard', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), getQualityDashboard);
router.post('/check/parcel/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), checkParcel);
router.post('/check/source/:sourceId', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), checkSource);
router.get('/issues', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), getIssues);

export default router;
