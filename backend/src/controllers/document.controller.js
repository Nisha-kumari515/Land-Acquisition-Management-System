import * as documentService from '../services/document.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listDocuments(request, response, next) {
    try { return sendSuccess(response, await documentService.listDocuments(request.query)); } catch (error) { return next(error); }
}

export async function getDocument(request, response, next) {
    try { return sendSuccess(response, await documentService.getDocumentById(request.params.id, request.user)); } catch (error) { return next(error); }
}

export async function createDocument(request, response, next) {
    try { return sendSuccess(response, await documentService.createDocument(request.body, request.user), 'Document created', 201); } catch (error) { return next(error); }
}

export async function archiveDocument(request, response, next) {
    try { return sendSuccess(response, await documentService.archiveDocument(request.params.id, request.user), 'Document archived'); } catch (error) { return next(error); }
}

export async function listVersions(request, response, next) {
    try { return sendSuccess(response, await documentService.listVersions(request.params.id)); } catch (error) { return next(error); }
}

export async function createVersion(request, response, next) {
    try { return sendSuccess(response, await documentService.createVersion(request.params.id, request.body, request.user), 'Document version created', 201); } catch (error) { return next(error); }
}
