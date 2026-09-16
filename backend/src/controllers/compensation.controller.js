import * as compensationService from '../services/compensation.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getByCase(request, response, next) {
    try {
        return sendSuccess(response, await compensationService.getCompensation(request.params.acquisitionCaseId));
    } catch (error) {
        return next(error);
    }
}

export async function create(request, response, next) {
    try {
        return sendSuccess(
            response,
            await compensationService.createCompensation(request.params.acquisitionCaseId, request.body),
            'Compensation record created',
            201
        );
    } catch (error) {
        return next(error);
    }
}

export async function update(request, response, next) {
    try {
        return sendSuccess(
            response,
            await compensationService.updateCompensation(request.params.acquisitionCaseId, request.body),
            'Compensation record updated'
        );
    } catch (error) {
        return next(error);
    }
}
