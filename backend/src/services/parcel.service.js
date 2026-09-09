import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

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
    const { page, pageSize, skip, take } = getPagination(query);
    const where = {
        ...(query.stateId ? { stateId: query.stateId } : {}),
        ...(query.districtId ? { districtId: query.districtId } : {}),
        ...(query.village ? { village: { contains: query.village, mode: 'insensitive' } } : {}),
        ...(query.ulpin ? { ulpin: query.ulpin } : {})
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
