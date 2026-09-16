import { Router } from 'express';
import { analyzeImpact, getAffectedParcels, getParcelGeometry, getProjectGeoJson } from '../controllers/gis.controller.js';
import { getImpactSummary } from '../controllers/impact.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.post('/projects/:projectId/impact-analysis', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), analyzeImpact);
router.post('/projects/:projectId/analyze-impact', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), analyzeImpact);
router.get('/projects/:projectId/impact-summary', getImpactSummary);
router.get('/projects/:projectId/affected-parcels', getAffectedParcels);
router.get('/parcels/:parcelId/geometry', getParcelGeometry);
router.get('/projects/:projectId/geojson', getProjectGeoJson);

export default router;
