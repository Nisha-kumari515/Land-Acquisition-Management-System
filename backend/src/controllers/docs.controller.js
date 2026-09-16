import { getApiDocs } from '../services/docs.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getDocs(_request, response, next) {
    try {
        return sendSuccess(response, getApiDocs(), 'API documentation retrieved');
    } catch (error) {
        return next(error);
    }
}
