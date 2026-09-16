import { env } from '../../config/env.js';
import { AppError } from '../../utils/response.js';

const SQ_METRES_PER_SQ_FOOT = 0.09290304;
const ASSAM_LESSA_SQ_FEET = 144;
const ASSAM_KATHA_LESSA = 20;
const ASSAM_BIGHA_KATHA = 5;

function numberValue(value) {
    const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function areaInSquareMetres(payload) {
    const bigha = numberValue(payload.dag_area_Bigha);
    const katha = numberValue(payload.dag_area_katha);
    const lessa = numberValue(payload.dag_area_lessa);
    const totalLessa = (bigha * ASSAM_BIGHA_KATHA * ASSAM_KATHA_LESSA) + (katha * ASSAM_KATHA_LESSA) + lessa;
    const area = totalLessa * ASSAM_LESSA_SQ_FEET * SQ_METRES_PER_SQ_FOOT;

    if (area <= 0) {
        throw new AppError(502, 'ASSAM_INVALID_RESPONSE', 'Assam BhuNaksha response has no usable parcel area');
    }

    return Number(area.toFixed(4));
}

function parseSourceDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function mapBhuNakshaParcel(payload, input, sourceMetadata) {
    const sourceId = `BHUNAKSHA:${input.locationCode}:${input.dagNo}`;
    const pattadars = Array.isArray(payload.Pattadar_names) ? payload.Pattadar_names : [];

    return {
        sourceSystem: 'BHUNAKSHA',
        sourceId,
        dataOrigin: 'OFFICIAL_API',
        sourceUpdatedAt: parseSourceDate(payload.sourceUpdatedAt ?? payload.source_updated_at ?? payload.updated_at),
        lastSyncedAt: new Date(sourceMetadata.requestedAt),
        stateCode: input.stateCode ?? env.assamStateCode,
        districtCode: input.districtCode ?? env.assamDefaultDistrictCode,
        circle: input.circle ?? null,
        village: payload.village ?? payload.Village ?? `Location ${input.locationCode}`,
        dagNo: input.dagNo,
        pattaNo: payload.Patta_number ?? payload.patta_number ?? null,
        area: areaInSquareMetres(payload),
        landClass: payload.land_class ?? null,
        owners: pattadars.map((owner) => ({
            name: String(owner.Pattadar_name ?? owner.name ?? '').trim(),
            identifier: null,
            ownershipPct: null,
            isVerified: true
        })).filter((owner) => owner.name),
        rawSourcePayload: payload
    };
}