import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function checkParcel(request, response, next) {
    try {
        const parcelId = request.params.id;
        const issues = [];

        const parcel = await prisma.parcel.findUnique({
            where: { id: parcelId },
            include: { owners: true }
        });

        if (!parcel) {
            return response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parcel not found' } });
        }

        if (!parcel.ulpin) issues.push(createIssue('HIGH', 'MISSING_IDENTIFIER', parcelId, 'Parcel missing ULPIN', 'Update parcel with official ULPIN'));
        if (Number(parcel.area) <= 0) issues.push(createIssue('HIGH', 'INVALID_AREA', parcelId, 'Parcel area is zero or negative', 'Correct the parcel area'));
        if (!parcel.owners || parcel.owners.length === 0) issues.push(createIssue('MEDIUM', 'MISSING_OWNERSHIP', parcelId, 'Parcel has no associated owners', 'Fetch or update ownership records'));
        if (!parcel.sourceSystem || !parcel.sourceId) issues.push(createIssue('MEDIUM', 'MISSING_SOURCE_INFO', parcelId, 'Parcel is missing external source identifiers', 'Link to authoritative land record system'));

        const geoCheck = await prisma.$queryRaw`
            SELECT 
                ST_IsValid(geometry) as valid, 
                ST_SRID(geometry) as srid, 
                ST_Area(geometry) as calc_area 
            FROM "Parcel" 
            WHERE id = ${parcelId} AND geometry IS NOT NULL
        `;
        
        if (geoCheck && geoCheck.length > 0 && geoCheck[0].valid !== null) {
            if (!geoCheck[0].valid) issues.push(createIssue('HIGH', 'INVALID_GEOMETRY', parcelId, 'Parcel geometry is invalid', 'Fix topological errors in geometry'));
            if (geoCheck[0].srid !== 4326) issues.push(createIssue('HIGH', 'INVALID_SRID', parcelId, `Geometry SRID is ${geoCheck[0].srid}, expected 4326`, 'Reproject geometry to EPSG:4326'));
            
            // Allow 5% variance in area calculation
            const calcArea = geoCheck[0].calc_area || 0;
            const reportedArea = Number(parcel.area);
            if (reportedArea > 0 && Math.abs(calcArea - reportedArea) / reportedArea > 0.05) {
                issues.push(createIssue('LOW', 'AREA_INCONSISTENCY', parcelId, `Calculated area (${Math.round(calcArea)} sqm) differs from reported area (${reportedArea} sqm)`, 'Verify geometry boundary or reported area'));
            }
        } else {
            issues.push(createIssue('HIGH', 'MISSING_GEOMETRY', parcelId, 'Parcel has no geometry', 'Digitize parcel geometry'));
        }

        if (parcel.updatedAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
            issues.push(createIssue('LOW', 'STALE_SYNC', parcelId, 'Parcel record hasn\'t been synced in over 30 days', 'Trigger manual sync with source system'));
        }

        return sendSuccess(response, { issues }, 'Parcel data quality check complete');
    } catch (error) { return next(error); }
}

export async function checkSource(request, response, next) {
    try {
        const sourceId = request.params.sourceId;
        const issues = [];
        
        const count = await prisma.parcel.count({ where: { sourceId } });
        if (count > 1) {
            issues.push(createIssue('HIGH', 'DUPLICATE_SOURCE_ID', sourceId, `Multiple parcels share the same sourceId ${sourceId}`, 'Deduplicate parcel records or investigate sync bug'));
        }
        
        return sendSuccess(response, { issues }, 'Source data quality check complete');
    } catch (error) { return next(error); }
}

export async function getIssues(request, response, next) {
    try {
        return sendSuccess(response, { issues: [] }, 'This is a mock endpoint. Actual issues are not yet persisted to DB.');
    } catch (error) { return next(error); }
}

function createIssue(severity, type, entityId, message, recommendedAction) {
    return { severity, type, entityId, message, recommendedAction };
}
