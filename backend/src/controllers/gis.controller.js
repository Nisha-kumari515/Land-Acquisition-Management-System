import { analyzeProjectImpact } from '../services/gis.service.js';
import { sendSuccess } from '../utils/response.js';

export async function analyzeImpact(request, response, next) {
    try {
        const result = await analyzeProjectImpact(request.params.projectId, request.body);
        return sendSuccess(response, result, 'Project impact analysis completed');
    } catch (error) {
        return next(error);
    }
}
