import { Router } from 'express';
import * as acquisitionController from '../controllers/acquisition.controller.js';

const router = Router();

router.get('/:parcelId', acquisitionController.getByParcel);
router.patch('/:id/stage', acquisitionController.changeStage);

export default router;
