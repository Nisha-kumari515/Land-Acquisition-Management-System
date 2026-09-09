import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelRoutes from './parcel.routes.js';
import projectRoutes from './project.routes.js';
import gisRoutes from './gis.routes.js';
import acquisitionRoutes from './acquisition.routes.js';
import compensationRoutes from './compensation.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/parcels', parcelRoutes);
router.use('/projects', projectRoutes);
router.use('/', gisRoutes);
router.use('/acquisition', acquisitionRoutes);
router.use('/compensation', compensationRoutes);

export default router;
