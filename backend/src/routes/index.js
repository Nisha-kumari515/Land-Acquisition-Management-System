import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelRoutes from './parcel.routes.js';
import projectRoutes from './project.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/parcels', parcelRoutes);
router.use('/projects', projectRoutes);

export default router;
