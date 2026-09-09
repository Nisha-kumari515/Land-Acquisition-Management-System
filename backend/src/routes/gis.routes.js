import { Router } from 'express';
import { analyzeImpact } from '../controllers/gis.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.post('/projects/:projectId/impact-analysis', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), analyzeImpact);

export default router;
