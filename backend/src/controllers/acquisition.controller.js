import * as acquisitionService from '../services/acquisition.service.js';
import { AppError, sendSuccess } from '../utils/response.js';

export async function getByParcel(request, response, next) {
    try {
        return sendSuccess(response, await acquisitionService.getCasesByParcel(request.params.parcelId));
    } catch (error) {
        return next(error);
    }
}

export async function changeStage(request, response, next) {
    try {
        if (request.body.changedById && request.body.changedById !== request.user.sub) {
            return next(new AppError(403, 'FORBIDDEN', 'The authenticated user must perform the stage transition'));
        }
        return sendSuccess(
            response,
            await acquisitionService.transitionStage(request.params.id, {
                ...request.body,
                changedById: request.user.sub
            }),
            'Acquisition stage changed'
        );
    } catch (error) {
        return next(error);
    }
}
