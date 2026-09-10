import { Router } from 'express';
import { getMapParcels, getMapProjects, getMapAffectedParcels } from '../controllers/map.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/parcels', getMapParcels);
router.get('/projects', getMapProjects);
router.get('/affected-parcels', getMapAffectedParcels);

export default router;
