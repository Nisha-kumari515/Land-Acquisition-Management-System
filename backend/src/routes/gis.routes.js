import { Router } from 'express';
import { analyzeImpact } from '../controllers/gis.controller.js';

const router = Router();

router.post('/projects/:projectId/impact-analysis', analyzeImpact);

export default router;
