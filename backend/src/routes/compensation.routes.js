import { Router } from 'express';
import * as compensationController from '../controllers/compensation.controller.js';

const router = Router();

router.get('/:acquisitionCaseId', compensationController.getByCase);
router.post('/:acquisitionCaseId', compensationController.create);
router.patch('/:acquisitionCaseId', compensationController.update);

export default router;
