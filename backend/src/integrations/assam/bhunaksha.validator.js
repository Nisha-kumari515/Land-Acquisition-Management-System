import { AppError } from '../../utils/response.js';

export function validateBhuNakshaResponse(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new AppError(502, 'ASSAM_INVALID_RESPONSE', 'Assam BhuNaksha returned an invalid parcel payload');
    }

    const hasArea = ['dag_area_Bigha', 'dag_area_katha', 'dag_area_lessa']
        .some((field) => payload[field] !== undefined && payload[field] !== null && String(payload[field]).trim() !== '');

    if (!hasArea) {
        throw new AppError(502, 'ASSAM_INVALID_RESPONSE', 'Assam BhuNaksha response is missing dag area');
    }

    return payload;
}