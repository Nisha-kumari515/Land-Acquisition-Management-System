import { AppError } from './response.js';

const supportedTypes = new Set(['Polygon', 'MultiPolygon']);

export function validateProjectGeometry(geometry, srid) {
    if (!geometry || typeof geometry !== 'object' || !supportedTypes.has(geometry.type)) {
        throw new AppError(400, 'INVALID_GEOMETRY', 'geometry must be a GeoJSON Polygon or MultiPolygon');
    }

    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length === 0) {
        throw new AppError(400, 'INVALID_GEOMETRY', 'geometry.coordinates must be a non-empty array');
    }

    if (!Number.isInteger(srid) || srid <= 0) {
        throw new AppError(400, 'INVALID_SRID', 'srid must be a positive integer');
    }

    return { geometry, srid };
}

export function normalizeSpatialResult(row) {
    return {
        parcelId: row.parcel_id,
        totalArea: Number(row.total_area),
        affectedArea: Number(row.affected_area),
        affectedPercentage: Number(row.affected_percentage)
    };
}
