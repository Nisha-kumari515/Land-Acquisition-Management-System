import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', dashboardController.getOverview);
router.get('/projects', dashboardController.getProjectSummary);
router.get('/analytics', dashboardController.getAdvancedAnalytics);
router.get('/national', dashboardController.getNationalDashboard);
router.get('/state/:stateId', dashboardController.getStateDashboard);
router.get('/district/:districtId', dashboardController.getDistrictDashboard);
router.get('/project/:projectId', dashboardController.getProjectDashboard);

export default router;
