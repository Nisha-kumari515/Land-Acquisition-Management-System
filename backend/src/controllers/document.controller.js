import * as documentService from '../services/document.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listVersions(request, response, next) {
    try { return sendSuccess(response, await documentService.listVersions(request.params.id)); } catch (error) { return next(error); }
}
export async function createVersion(request, response, next) {
    try { return sendSuccess(response, await documentService.createVersion(request.params.id, request.body, request.user), 'Document version created', 201); } catch (error) { return next(error); }
}