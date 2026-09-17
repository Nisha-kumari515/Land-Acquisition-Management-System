import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as geometryController from '../controllers/project-geometry.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: List all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 */
router.get('/', projectController.list);

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 */
router.get('/:id', projectController.getById);
router.get('/:id/geometry', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), geometryController.getGeometry);
router.put('/:id/geometry', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), validateBody(['geojson']), geometryController.updateGeometry);
router.delete('/:id/geometry', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), geometryController.deleteGeometry);
router.get('/:id/intelligence', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.getProjectIntelligence);

/**
 * @openapi
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               stateId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post('/', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), validateBody(['code', 'name', 'department', 'stateId']), projectController.create);
router.patch('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.update);
router.post('/:id/submit', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.submit);
router.post('/:id/approve', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), projectController.approve);
router.post('/:id/reject', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), projectController.reject);
router.post('/:id/archive', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER'), projectController.archive);
router.delete('/:id', requireRole('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'), projectController.remove);

export default router;
