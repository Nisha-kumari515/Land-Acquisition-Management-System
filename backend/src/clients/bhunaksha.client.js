import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';
import { validateBhuNakshaResponse } from '../integrations/assam/bhunaksha.validator.js';

const endpointPath = '/proxy/getDagInfoFromDharitree';

async function fetchFromAssam(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.assamApiTimeoutMs);
    try {
        const response = await (options.fetchImpl || fetch)(`${env.assamBhuNakshaBaseUrl.replace(/\/$/, '')}${endpoint}`, {
            ...options,
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://bhunaksha.assam.gov.in/',
                'Origin': 'https://bhunaksha.assam.gov.in',
                ...options.headers 
            },
            signal: controller.signal
        });
        const responseText = await response.text();
        let payload;
        try {
            payload = responseText ? JSON.parse(responseText) : null;
        } catch (_error) {
            throw new AppError(502, 'ASSAM_INVALID_RESPONSE', 'Assam BhuNaksha returned invalid JSON');
        }
        if (!response.ok) {
            throw new AppError(502, 'ASSAM_API_ERROR', `Assam BhuNaksha returned HTTP ${response.status}`);
        }
        return {
            payload,
            sourceMetadata: {
                endpoint: `${env.assamBhuNakshaBaseUrl.replace(/\/$/, '')}${endpoint}`,
                requestedAt: new Date().toISOString(),
                httpStatus: response.status,
                sourceSystem: 'BHUNAKSHA',
                dataOrigin: 'OFFICIAL_API'
            }
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new AppError(504, 'ASSAM_API_TIMEOUT', 'Assam BhuNaksha request timed out');
        }
        if (error instanceof AppError) throw error;
        throw new AppError(502, 'ASSAM_API_UNAVAILABLE', 'Assam BhuNaksha is unavailable');
    } finally {
        clearTimeout(timeout);
    }
}

export async function getDagInfo({ locationCode, dagNo, fetchImpl = fetch }) {
    const result = await fetchFromAssam(endpointPath, {
        method: 'POST',
        fetchImpl,
        body: JSON.stringify({ location: locationCode, dag_no: dagNo })
    });
    validateBhuNakshaResponse(result.payload);
    return result;
}

export async function getDistricts({ fetchImpl = fetch } = {}) {
    return await fetchFromAssam('/proxy/districts', { method: 'GET', fetchImpl });
}

export async function getCircles({ district, district_code, districtCode, fetchImpl = fetch }) {
    return await fetchFromAssam('/proxy/circles', {
        method: 'POST',
        fetchImpl,
        body: JSON.stringify({ district: district || districtCode || district_code })
    });
}

export async function getVillages({ circle, circle_code, circleCode, fetchImpl = fetch }) {
    return await fetchFromAssam('/proxy/villages', {
        method: 'POST',
        fetchImpl,
        body: JSON.stringify({ circle: circle || circleCode || circle_code })
    });
}

export async function getAllDagsFromDharitree({ location, village_code, villageCode, fetchImpl = fetch }) {
    return await fetchFromAssam('/proxy/getAllDagsFromDharitree', {
        method: 'POST',
        fetchImpl,
        body: JSON.stringify({ location: location || villageCode || village_code })
    });
}

export async function getPreMapForPlot({ state, district, tehsil, village, fetchImpl = fetch }) {
    return await fetchFromAssam(`/getPreMapForPlot?state=${state}&district=${district}&tehsil=${tehsil}&village=${village}`, {
        method: 'GET',
        fetchImpl
    });
}
