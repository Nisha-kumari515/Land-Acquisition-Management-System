import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', projectController.list);
router.get('/:id', projectController.getById);
router.post('/', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), validateBody(['code', 'name', 'department', 'stateId', 'createdById']), projectController.create);
router.patch('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.update);
router.delete('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.remove);

export default router;
