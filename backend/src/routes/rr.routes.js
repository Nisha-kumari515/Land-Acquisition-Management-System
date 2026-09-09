import { Router } from 'express';
import * as rrController from '../controllers/rr.controller.js';

const router = Router();

router.get('/families', rrController.listFamilies);
router.get('/families/:id', rrController.getFamily);
router.post('/families', rrController.createFamily);
router.patch('/families/:id', rrController.updateFamily);
router.post('/families/:familyId/entitlements', rrController.createEntitlement);
router.patch('/entitlements/:id', rrController.updateEntitlement);

export default router;
