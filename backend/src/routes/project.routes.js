import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/', projectController.list);
router.get('/:id', projectController.getById);
router.post('/', validateBody(['code', 'name', 'department', 'stateId', 'createdById']), projectController.create);
router.patch('/:id', projectController.update);
router.delete('/:id', projectController.remove);

export default router;
