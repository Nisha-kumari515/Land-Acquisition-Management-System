import { Router } from 'express';
import * as acquisitionController from '../controllers/acquisition.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:parcelId', acquisitionController.getByParcel);
router.patch('/:id/stage', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), acquisitionController.changeStage);

export default router;
