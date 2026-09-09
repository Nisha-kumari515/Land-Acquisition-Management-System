import * as acquisitionService from '../services/acquisition.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getByParcel(request, response, next) {
    try {
        return sendSuccess(response, await acquisitionService.getCasesByParcel(request.params.parcelId));
    } catch (error) {
        return next(error);
    }
}

export async function changeStage(request, response, next) {
    try {
        return sendSuccess(
            response,
            await acquisitionService.transitionStage(request.params.id, request.body),
            'Acquisition stage changed'
        );
    } catch (error) {
        return next(error);
    }
}
