import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/states', adminController.getStates);
router.get('/districts', adminController.getDistricts);
router.get('/circles', adminController.getCircles);
router.get('/villages', adminController.getVillages);

export default router;
