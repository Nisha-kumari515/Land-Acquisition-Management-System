import { Router } from 'express';
import * as parcelController from '../controllers/parcel.controller.js';
import { validateBody, validatePositiveNumber } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', parcelController.list);
router.get('/:id', parcelController.getById);
router.post('/', validateBody(['stateId', 'districtId', 'village', 'area', 'sourceSystem', 'sourceId']), validatePositiveNumber('area'), parcelController.create);
router.patch('/:id', parcelController.update);
router.delete('/:id', parcelController.remove);

export default router;
