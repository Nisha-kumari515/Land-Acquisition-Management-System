import * as auditService from '../services/audit.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listAuditLogs(request, response, next) {
    try {
        return sendSuccess(response, await auditService.listAuditLogs(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getAuditTrail(request, response, next) {
    try {
        return sendSuccess(response, await auditService.getAuditTrail(request.params.entity, request.params.entityId));
    } catch (error) {
        return next(error);
    }
}
