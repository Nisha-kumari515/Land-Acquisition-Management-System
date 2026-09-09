import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const riskLevels = new Set(['LOW', 'MEDIUM', 'HIGH']);
const acquisitionStages = new Set(['PROPOSAL', 'SCRUTINY', 'SURVEY', 'NOTIFICATION', 'AWARD', 'COMPENSATION', 'POSSESSION', 'RR', 'COMPLETED']);
const compensationStatuses = new Set(['PENDING', 'ASSESSED', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'ON_HOLD']);

function validateFilter(value, allowed, fieldName) {
    if (value && !allowed.has(value)) throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} is invalid`);
}

const parcelInclude = {
    state: { select: { id: true, code: true, name: true } },
    district: { select: { id: true, code: true, name: true } },
    owners: true
};

function parcelData(input) {
    return {
        stateId: input.stateId,
        districtId: input.districtId,
        circle: input.circle ?? null,
        village: input.village,
        dagNo: input.dagNo ?? null,
        pattaNo: input.pattaNo ?? null,
        ulpin: input.ulpin ?? null,
        area: input.area,
        sourceSystem: input.sourceSystem,
        sourceId: input.sourceId
    };
}

async function assertGeography(stateId, districtId) {
    const district = await prisma.district.findFirst({ where: { id: districtId, stateId } });
    if (!district) {
        throw new AppError(400, 'INVALID_GEOGRAPHY', 'districtId must belong to stateId');
    }
}

export async function listParcels(query) {
    validateFilter(query.riskLevel, riskLevels, 'riskLevel');
    validateFilter(query.acquisitionStatus, acquisitionStages, 'acquisitionStatus');
    validateFilter(query.compensationStatus, compensationStatuses, 'compensationStatus');
    const { page, pageSize, skip, take } = getPagination(query);
    const projectParcelFilters = {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.riskLevel ? { riskLevel: query.riskLevel } : {}),
        ...(query.acquisitionStatus ? { acquisitionStage: query.acquisitionStatus } : {}),
        ...(query.compensationStatus ? { compensationStatus: query.compensationStatus } : {})
    };
    const where = {
        ...(query.stateId ? { stateId: query.stateId } : {}),
        ...(query.state ? { state: { OR: [{ id: query.state }, { code: query.state }, { name: { contains: query.state, mode: 'insensitive' } }] } } : {}),
        ...(query.districtId ? { districtId: query.districtId } : {}),
        ...(query.district ? { district: { OR: [{ id: query.district }, { code: query.district }, { name: { contains: query.district, mode: 'insensitive' } }] } } : {}),
        ...(query.village ? { village: { contains: query.village, mode: 'insensitive' } } : {}),
        ...(query.circle ? { circle: { contains: query.circle, mode: 'insensitive' } } : {}),
        ...(query.dagNo ? { dagNo: { contains: query.dagNo, mode: 'insensitive' } } : {}),
        ...(query.pattaNo ? { pattaNo: { contains: query.pattaNo, mode: 'insensitive' } } : {}),
        ...(query.ulpin ? { ulpin: query.ulpin } : {}),
        ...(query.sourceSystem ? { sourceSystem: query.sourceSystem } : {}),
        ...(query.search ? {
            OR: [
                { village: { contains: query.search, mode: 'insensitive' } },
                { dagNo: { contains: query.search, mode: 'insensitive' } },
                { pattaNo: { contains: query.search, mode: 'insensitive' } },
                { ulpin: { contains: query.search, mode: 'insensitive' } },
                { sourceId: { contains: query.search, mode: 'insensitive' } },
                { owners: { some: { name: { contains: query.search, mode: 'insensitive' } } } }
            ]
        } : {}),
        ...(query.ownerName ? { owners: { some: { name: { contains: query.ownerName, mode: 'insensitive' } } } } : {}),
        ...(Object.keys(projectParcelFilters).length > 0 ? { projectParcels: { some: projectParcelFilters } } : {}),
        ...(query.districtName ? { district: { name: { contains: query.districtName, mode: 'insensitive' } } } : {})
    };
    const [items, total] = await prisma.$transaction([
        prisma.parcel.findMany({ where, include: parcelInclude, orderBy: { createdAt: 'desc' }, skip, take }),
        prisma.parcel.count({ where })
    ]);

    return paginatedResponse(items, total, page, pageSize);
}

export async function getParcel(id) {
    const parcel = await prisma.parcel.findUnique({ where: { id }, include: parcelInclude });
    if (!parcel) throw new AppError(404, 'PARCEL_NOT_FOUND', 'Parcel not found');
    return parcel;
}

export async function createParcel(input) {
    await assertGeography(input.stateId, input.districtId);
    return prisma.parcel.create({ data: parcelData(input), include: parcelInclude });
}

export async function updateParcel(id, input) {
    const existing = await getParcel(id);
    const stateId = input.stateId ?? existing.stateId;
    const districtId = input.districtId ?? existing.districtId;
    await assertGeography(stateId, districtId);

    return prisma.parcel.update({
        where: { id },
        data: parcelData({ ...existing, ...input, stateId, districtId }),
        include: parcelInclude
    });
}

export async function deleteParcel(id) {
    await getParcel(id);
    return prisma.parcel.delete({ where: { id } });
}
