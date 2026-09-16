import * as rrService from '../services/rr.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listFamilies(request, response, next) {
    try {
        return sendSuccess(response, await rrService.listFamilies(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getFamily(request, response, next) {
    try {
        return sendSuccess(response, await rrService.getFamilyById(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function createFamily(request, response, next) {
    try {
        return sendSuccess(response, await rrService.createFamily(request.body), 'R&R family created', 201);
    } catch (error) {
        return next(error);
    }
}

export async function updateFamily(request, response, next) {
    try {
        return sendSuccess(response, await rrService.updateFamily(request.params.id, request.body), 'R&R family updated');
    } catch (error) {
        return next(error);
    }
}

export async function createEntitlement(request, response, next) {
    try {
        return sendSuccess(
            response,
            await rrService.createEntitlement(request.params.familyId, request.body),
            'R&R entitlement created',
            201
        );
    } catch (error) {
        return next(error);
    }
}

export async function updateEntitlement(request, response, next) {
    try {
        return sendSuccess(response, await rrService.updateEntitlement(request.params.id, request.body), 'R&R entitlement updated');
    } catch (error) {
        return next(error);
    }
}
