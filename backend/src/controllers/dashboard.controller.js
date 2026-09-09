import * as dashboardService from '../services/dashboard.service.js';
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
        return sendSuccess(response, await dashboardService.getProjectSummary(), 'Project summaries retrieved');
    } catch (error) {
        return next(error);
    }
}
