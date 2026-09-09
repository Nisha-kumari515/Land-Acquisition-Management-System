import { Router } from 'express';
import * as documentController from '../controllers/document.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.get('/:id/versions', documentController.listVersions);
router.post('/:id/version', documentController.createVersion);
export default router;