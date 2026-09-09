import { Router } from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', auditController.listAuditLogs);
router.get('/:entity/:entityId', auditController.getAuditTrail);

export default router;
