import * as riskService from '../services/risk.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listRisks(request, response, next) {
    try {
        return sendSuccess(response, await riskService.listRiskAlerts(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getProjectRisks(request, response, next) {
    try {
        return sendSuccess(response, await riskService.getProjectRisk(request.params.projectId));
    } catch (error) {
        return next(error);
    }
}

export async function evaluateParcel(request, response, next) {
    try {
        const projectParcelId = request.body?.projectParcelId ?? request.params.projectParcelId;
        return sendSuccess(
            response,
            await riskService.evaluateProjectParcel(projectParcelId),
            'Risk evaluation completed',
            201
        );
    } catch (error) {
        return next(error);
    }
}
