import * as parcelService from '../services/parcel.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(request, response, next) {
    try {
        return sendSuccess(response, await parcelService.listParcels(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getById(request, response, next) {
    try {
        return sendSuccess(response, await parcelService.getParcel(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function create(request, response, next) {
    try {
        return sendSuccess(response, await parcelService.createParcel(request.body), 'Parcel created', 201);
    } catch (error) {
        return next(error);
    }
}

export async function update(request, response, next) {
    try {
        return sendSuccess(response, await parcelService.updateParcel(request.params.id, request.body), 'Parcel updated');
    } catch (error) {
        return next(error);
    }
}

export async function getParcelIntelligence(request, response, next) {
    try {
        const data = await parcelService.getParcelIntelligence(request.params.id);
        return sendSuccess(response, data, 'Parcel intelligence retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

export async function getParcelSource(request, response, next) {
    try {
        const data = await parcelService.getParcelSource(request.params.id);
        return sendSuccess(response, data, 'Parcel source retrieved');
    } catch (error) {
        return next(error);
    }
}

export async function getParcelSourceHistory(request, response, next) {
    try {
        const data = await parcelService.getParcelSourceHistory(request.params.id);
        return sendSuccess(response, data, 'Parcel source history retrieved');
    } catch (error) {
        return next(error);
    }
}

export async function remove(request, response, next) {
    try {
        await parcelService.deleteParcel(request.params.id);
        return response.status(204).send();
    } catch (error) {
        return next(error);
    }
}
