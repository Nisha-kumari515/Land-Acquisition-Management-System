import * as dashboardService from '../services/dashboard.service.js';
import { getAnalytics, getDashboardAnalytics } from '../services/dashboard-analytics.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getOverview(request, response, next) {
    try {
        return sendSuccess(response, await dashboardService.getOverview(), 'Dashboard overview retrieved');
    } catch (error) {
        return next(error);
    }
}

export async function getProjectSummary(request, response, next) {
    try {
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 50;
        return sendSuccess(response, await dashboardService.getProjectSummary(page, limit), 'Project summaries retrieved');
    } catch (error) {
        return next(error);
    }
}

export async function getAdvancedAnalytics(_request, response, next) {
    try { return sendSuccess(response, await getAnalytics(), 'Advanced dashboard analytics retrieved'); } catch (error) { return next(error); }
}

export async function getNationalDashboard(req, res, next) {
    try { return sendSuccess(res, await getDashboardAnalytics('national'), 'National dashboard retrieved'); } catch (error) { return next(error); }
}

export async function getStateDashboard(req, res, next) {
    try { return sendSuccess(res, await getDashboardAnalytics('state', req.params.stateId), 'State dashboard retrieved'); } catch (error) { return next(error); }
}

export async function getDistrictDashboard(req, res, next) {
    try { return sendSuccess(res, await getDashboardAnalytics('district', req.params.districtId), 'District dashboard retrieved'); } catch (error) { return next(error); }
}

export async function getProjectDashboard(req, res, next) {
    try { return sendSuccess(res, await getDashboardAnalytics('project', req.params.projectId), 'Project dashboard retrieved'); } catch (error) { return next(error); }
}
