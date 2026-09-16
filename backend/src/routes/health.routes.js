import { Router } from 'express';
import * as healthController from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthController.getOverallHealth);
router.get('/database', healthController.getDatabaseHealth);
router.get('/postgis', healthController.getPostgisHealth);
router.get('/integrations', healthController.getIntegrationsHealth);

export default router;
