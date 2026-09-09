import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';
import { validateBhuNakshaResponse } from '../integrations/assam/bhunaksha.validator.js';

const endpointPath = '/proxy/getDagInfoFromDharitree';

export async function getDagInfo({ locationCode, dagNo, fetchImpl = fetch }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.assamApiTimeoutMs);

    try {
        const response = await fetchImpl(`${env.assamBhuNakshaBaseUrl.replace(/\/$/, '')}${endpointPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ location: locationCode, dag_no: dagNo }),
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

        validateBhuNakshaResponse(payload);

        return {
            payload,
            sourceMetadata: {
                endpoint: `${env.assamBhuNakshaBaseUrl.replace(/\/$/, '')}${endpointPath}`,
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
