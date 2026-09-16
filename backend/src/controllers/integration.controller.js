import * as integrationService from '../services/integration.service.js';
import { syncAssamParcel } from '../adapters/assam.adapter.js';
import * as bhunakshaClient from '../clients/bhunaksha.client.js';
import { sendSuccess } from '../utils/response.js';

export async function listIntegrations(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.listIntegrations());
    } catch (error) {
        return next(error);
    }
}

export async function getAssamStatus(_request, response, next) {
    try {
        return sendSuccess(response, await integrationService.getAssamStatus());
    } catch (error) {
        return next(error);
    }
}

export async function getAssamDistricts(request, response, next) {
    try {
        const result = await bhunakshaClient.getDistricts();
        return sendSuccess(response, result.payload);
    } catch (error) {
        return next(error);
    }
}

export async function getAssamCircles(request, response, next) {
    try {
        // Assume district property is sent, mapping to whatever getCircles needs
        const result = await bhunakshaClient.getCircles(request.body);
        return sendSuccess(response, result.payload);
    } catch (error) {
        return next(error);
    }
}

export async function getAssamVillages(request, response, next) {
    try {
        const result = await bhunakshaClient.getVillages(request.body);
        return sendSuccess(response, result.payload);
    } catch (error) {
        return next(error);
    }
}

export async function getAssamDags(request, response, next) {
    try {
        const result = await bhunakshaClient.getAllDagsFromDharitree(request.body);
        return sendSuccess(response, result.payload);
    } catch (error) {
        return next(error);
    }
}

export async function getAssamMap(request, response, next) {
    try {
        const result = await bhunakshaClient.getPreMapForPlot(request.query);
        return sendSuccess(response, result.payload);
    } catch (error) {
        return next(error);
    }
}

export async function listAllSyncLogs(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.listAllSyncLogs(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getSyncLog(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.getSyncLog(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function getIntegration(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.getIntegration(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function createIntegration(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.createIntegration(request.body), 'Integration created', 201);
    } catch (error) {
        return next(error);
    }
}

export async function listSyncLogs(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.listSyncLogs(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function syncIntegration(request, response, next) {
    try {
        return sendSuccess(response, await integrationService.syncIntegration(request.params.id, request.body), 'Sync log created', 201);
    } catch (error) {
        return next(error);
    }
}

export async function syncAssam(request, response, next) {
    try {
        return sendSuccess(
            response,
            await syncAssamParcel(request.body),
            'Assam parcel synchronized',
            201
        );
    } catch (error) {
        return next(error);
    }
}
