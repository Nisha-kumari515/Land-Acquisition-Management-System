import { Router } from 'express';
import * as parcelController from '../controllers/parcel.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody, validatePositiveNumber } from '../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', parcelController.list);
router.get('/:id', parcelController.getById);
router.post('/', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER'), validateBody(['stateId', 'districtId', 'village', 'area', 'sourceSystem', 'sourceId']), validatePositiveNumber('area'), parcelController.create);
router.patch('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER'), parcelController.update);
router.delete('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), parcelController.remove);

export default router;
