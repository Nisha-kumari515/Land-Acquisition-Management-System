import { Router } from 'express';
import healthRoutes from './health.routes.js';
import parcelRoutes from './parcel.routes.js';
import projectRoutes from './project.routes.js';
import gisRoutes from './gis.routes.js';
import acquisitionRoutes from './acquisition.routes.js';
import compensationRoutes from './compensation.routes.js';
import rrRoutes from './rr.routes.js';
import riskRoutes from './risks.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import integrationRoutes from './integration.routes.js';
import authRoutes from './auth.routes.js';
import auditRoutes from './audit.routes.js';
import docsRoutes from './docs.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/audit', auditRoutes);
router.use('/docs', docsRoutes);
router.use('/parcels', parcelRoutes);
router.use('/projects', projectRoutes);
router.use('/', gisRoutes);
router.use('/acquisition', acquisitionRoutes);
router.use('/compensation', compensationRoutes);
router.use('/rr', rrRoutes);
router.use('/risks', riskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/integrations', integrationRoutes);

export default router;
