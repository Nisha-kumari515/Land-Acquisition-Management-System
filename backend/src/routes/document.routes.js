import { Router } from 'express';
import * as documentController from '../controllers/document.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', documentController.listDocuments);
router.post('/', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), documentController.createDocument);
router.get('/:id', documentController.getDocument);
router.delete('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), documentController.archiveDocument);

router.get('/:id/versions', documentController.listVersions);
router.post('/:id/versions', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), documentController.createVersion);

export default router;
