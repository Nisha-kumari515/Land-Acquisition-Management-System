import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const allowedRiskLevels = new Set(['LOW', 'MEDIUM', 'HIGH']);

function numericFilter(value, fieldName, minimum = 0, maximum = 100) {
    if (value === undefined) return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
        throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} must be between ${minimum} and ${maximum}`);
    }
    return parsed;
}

function buildAffectedWhere(projectId, query) {
    const conditions = [Prisma.sql`pp."projectId" = ${projectId}`];
    if (query.riskLevel) {
        if (!allowedRiskLevels.has(query.riskLevel)) throw new AppError(400, 'VALIDATION_ERROR', 'riskLevel is invalid');
        conditions.push(Prisma.sql`pp."riskLevel" = ${query.riskLevel}::"RiskLevel"`);
    }
    if (query.acquisitionStatus) conditions.push(Prisma.sql`pp."acquisitionStage" = ${query.acquisitionStatus}::"AcquisitionStage"`);
    if (query.compensationStatus) conditions.push(Prisma.sql`pp."compensationStatus" = ${query.compensationStatus}::"CompensationStatus"`);
    if (query.district) conditions.push(Prisma.sql`(d."name" ILIKE ${`%${query.district}%`} OR d."code" ILIKE ${`%${query.district}%`})`);
    if (query.village) conditions.push(Prisma.sql`p."village" ILIKE ${`%${query.village}%`}`);
    const affectedPercentage = numericFilter(query.affectedPercentage, 'affectedPercentage');
    if (affectedPercentage !== null) conditions.push(Prisma.sql`pp."affectedPercentage" >= ${affectedPercentage}`);
    return Prisma.join(conditions, ' AND ');
}

function parcelProperties(row) {
    return {
        parcelId: row.parcel_id,
        projectId: row.project_id,
        village: row.village,
        dagNo: row.dag_no,
        pattaNo: row.patta_no,
        ulpin: row.ulpin,
        district: row.district,
        riskLevel: row.risk_level,
        acquisitionStatus: row.acquisition_status,
        compensationStatus: row.compensation_status,
        affectedArea: Number(row.affected_area),
        affectedPercentage: Number(row.affected_percentage),
        sourceSystem: row.source_system,
        dataOrigin: row.data_origin
    };
}

async function assertProject(projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
}

export async function listAffectedParcels(projectId, query = {}) {
    await assertProject(projectId);
    const { page, pageSize, skip, take } = getPagination(query);
    const where = buildAffectedWhere(projectId, query);
    const rows = await prisma.$queryRaw`
        SELECT p."id" AS parcel_id, pp."projectId" AS project_id, p."village" AS village,
               p."dagNo" AS dag_no, p."pattaNo" AS patta_no, p."ulpin" AS ulpin,
               d."name" AS district, pp."riskLevel"::text AS risk_level,
               pp."acquisitionStage"::text AS acquisition_status,
               pp."compensationStatus"::text AS compensation_status,
               pp."affectedArea"::text AS affected_area,
               pp."affectedPercentage"::text AS affected_percentage,
               p."sourceSystem" AS source_system, p."dataOrigin" AS data_origin
        FROM "ProjectParcel" pp
        JOIN "Parcel" p ON p."id" = pp."parcelId"
        JOIN "District" d ON d."id" = p."districtId"
        WHERE ${where}
        ORDER BY p."id"
        OFFSET ${skip} LIMIT ${take}
    `;
    const totalRows = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS total
        FROM "ProjectParcel" pp
        JOIN "Parcel" p ON p."id" = pp."parcelId"
        JOIN "District" d ON d."id" = p."districtId"
        WHERE ${where}
    `;
    return paginatedResponse(rows.map(parcelProperties), totalRows[0].total, page, pageSize);
}

export async function getParcelGeometry(parcelId) {
    const rows = await prisma.$queryRaw`
        SELECT p."id" AS parcel_id, ST_IsValid(p.geometry) AS is_valid,
               ST_AsGeoJSON(p.geometry)::json AS geometry
        FROM "Parcel" p
        WHERE p."id" = ${parcelId} AND p.geometry IS NOT NULL
    `;
    if (rows.length === 0) throw new AppError(404, 'GEOMETRY_NOT_FOUND', 'Parcel geometry not found');
    if (!rows[0].is_valid) throw new AppError(422, 'INVALID_GEOMETRY', 'Parcel geometry is invalid');
    return { parcelId, geometry: rows[0].geometry };
}

export async function getProjectGeoJson(projectId, query = {}) {
    await assertProject(projectId);
    const where = buildAffectedWhere(projectId, query);
    const rows = await prisma.$queryRaw`
        SELECT p."id" AS parcel_id, pp."projectId" AS project_id, p."village" AS village,
               p."dagNo" AS dag_no, p."pattaNo" AS patta_no, p."ulpin" AS ulpin,
               d."name" AS district, pp."riskLevel"::text AS risk_level,
               pp."acquisitionStage"::text AS acquisition_status,
               pp."compensationStatus"::text AS compensation_status,
               pp."affectedArea"::text AS affected_area,
               pp."affectedPercentage"::text AS affected_percentage,
               p."sourceSystem" AS source_system, p."dataOrigin" AS data_origin,
               ST_AsGeoJSON(p.geometry)::json AS geometry
        FROM "ProjectParcel" pp
        JOIN "Parcel" p ON p."id" = pp."parcelId"
        JOIN "District" d ON d."id" = p."districtId"
        WHERE ${where} AND p.geometry IS NOT NULL AND ST_IsValid(p.geometry)
        ORDER BY p."id"
    `;
    return {
        type: 'FeatureCollection',
        features: rows.map((row) => ({ type: 'Feature', id: row.parcel_id, geometry: row.geometry, properties: parcelProperties(row) }))
    };
}