import { analyzeProjectImpact } from '../services/gis.service.js';
import * as gisReadService from '../services/gis-read.service.js';
import { sendSuccess } from '../utils/response.js';

export async function analyzeImpact(request, response, next) {
    try {
        const result = await analyzeProjectImpact(request.params.projectId, request.body);
        return sendSuccess(response, result, 'Project impact analysis completed');
    } catch (error) {
        return next(error);
    }
}

export async function getAffectedParcels(request, response, next) {
    try {
        return sendSuccess(response, await gisReadService.listAffectedParcels(request.params.projectId, request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getParcelGeometry(request, response, next) {
    try {
        return sendSuccess(response, await gisReadService.getParcelGeometry(request.params.parcelId));
    } catch (error) {
        return next(error);
    }
}

export async function getProjectGeoJson(request, response, next) {
    try {
        return sendSuccess(response, await gisReadService.getProjectGeoJson(request.params.projectId, request.query));
    } catch (error) {
        return next(error);
    }
}
