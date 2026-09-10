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
import notificationRoutes from './notification.routes.js';
import documentRoutes from './document.routes.js';
import fieldVerificationRoutes from './field-verification.routes.js';

const router = Router();

import { authLimiter, searchLimiter, gisLimiter, integrationLimiter } from '../middleware/rate-limit.middleware.js';

router.use('/health', healthRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/audit', auditRoutes);
router.use('/docs', docsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/documents', documentRoutes);
router.use('/field-verifications', fieldVerificationRoutes);
router.use('/parcels', parcelRoutes);
router.use('/projects', projectRoutes);
router.use('/', gisLimiter, gisRoutes);
router.use('/acquisition', acquisitionRoutes);
router.use('/compensation', compensationRoutes);
router.use('/rr', rrRoutes);
router.use('/risks', riskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/integrations', integrationLimiter, integrationRoutes);

import searchRoutes from './search.routes.js';
import mapRoutes from './map.routes.js';
import dataQualityRoutes from './data-quality.routes.js';

router.use('/search', searchLimiter, searchRoutes);
router.use('/map', gisLimiter, mapRoutes);
router.use('/data-quality', dataQualityRoutes);
export default router;
