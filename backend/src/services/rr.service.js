import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const familyInclude = {
    projectParcel: {
        select: {
            id: true,
            projectId: true,
            parcelId: true,
            rrStatus: true,
            project: { select: { code: true, name: true } },
            parcel: { select: { ulpin: true, village: true, dagNo: true } }
        }
    },
    entitlements: true
};

function positiveInteger(value, field) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new AppError(400, 'INVALID_RR_VALUE', `${field} must be a positive integer`);
    }
    return number;
}

function progressValue(value) {
    const progress = Number(value);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
        throw new AppError(400, 'INVALID_RR_PROGRESS', 'resettlementProgress must be an integer from 0 to 100');
    }
    return progress;
}

function amountValue(value) {
    if (value === null || value === undefined) return null;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
        throw new AppError(400, 'INVALID_AMOUNT', 'entitlement amount must be a non-negative number');
    }
    return amount;
}

async function getProjectParcel(id, transaction = prisma) {
    const projectParcel = await transaction.projectParcel.findUnique({ where: { id } });
    if (!projectParcel) throw new AppError(404, 'PROJECT_PARCEL_NOT_FOUND', 'Project-parcel relationship not found');
    return projectParcel;
}

async function getFamily(id, transaction = prisma) {
    const family = await transaction.rrFamily.findUnique({ where: { id }, include: familyInclude });
    if (!family) throw new AppError(404, 'RR_FAMILY_NOT_FOUND', 'R&R family not found');
    return family;
}

function familyData(input, existing = {}) {
    return {
        familyReference: input.familyReference ?? existing.familyReference,
        membersCount: input.membersCount === undefined ? existing.membersCount : positiveInteger(input.membersCount, 'membersCount'),
        eligible: input.eligible ?? existing.eligible ?? false,
        status: input.status ?? existing.status ?? 'PENDING',
        resettlementProgress: input.resettlementProgress === undefined
            ? existing.resettlementProgress ?? 0
            : progressValue(input.resettlementProgress)
    };
}

export async function listFamilies(query) {
    const where = {
        ...(query.projectParcelId ? { projectParcelId: query.projectParcelId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.eligible !== undefined ? { eligible: query.eligible === 'true' } : {})
    };
    return prisma.rrFamily.findMany({
        where,
        include: familyInclude,
        orderBy: { createdAt: 'desc' }
    });
}

export async function getFamilyById(id) {
    return getFamily(id);
}

export async function createFamily(input) {
    if (!input.familyReference) throw new AppError(400, 'VALIDATION_ERROR', 'familyReference is required');
    const projectParcel = await getProjectParcel(input.projectParcelId);
    const data = familyData(input, { membersCount: undefined });
    if (data.membersCount === undefined) data.membersCount = positiveInteger(input.membersCount, 'membersCount');

    return prisma.$transaction(async (transaction) => {
        const family = await transaction.rrFamily.create({ data: { projectParcelId: projectParcel.id, ...data }, include: familyInclude });
        await transaction.projectParcel.update({
            where: { id: projectParcel.id },
            data: { rrStatus: family.status }
        });
        return family;
    });
}

export async function updateFamily(id, input) {
    const existing = await getFamily(id);
    const data = familyData(input, existing);
    if (!data.familyReference) throw new AppError(400, 'VALIDATION_ERROR', 'familyReference is required');

    return prisma.$transaction(async (transaction) => {
        const family = await transaction.rrFamily.update({ where: { id }, data, include: familyInclude });
        await transaction.projectParcel.update({
            where: { id: family.projectParcelId },
            data: { rrStatus: family.status }
        });
        return family;
    });
}

export async function createEntitlement(familyId, input) {
    await getFamily(familyId);
    if (!input.entitlementType) throw new AppError(400, 'VALIDATION_ERROR', 'entitlementType is required');

    return prisma.rrEntitlement.create({
        data: {
            rrFamilyId: familyId,
            entitlementType: input.entitlementType,
            amount: amountValue(input.amount),
            status: input.status ?? 'PENDING'
        }
    });
}

export async function updateEntitlement(id, input) {
    const entitlement = await prisma.rrEntitlement.findUnique({ where: { id } });
    if (!entitlement) throw new AppError(404, 'RR_ENTITLEMENT_NOT_FOUND', 'R&R entitlement not found');

    return prisma.rrEntitlement.update({
        where: { id },
        data: {
            ...(input.entitlementType !== undefined ? { entitlementType: input.entitlementType } : {}),
            ...(input.amount !== undefined ? { amount: amountValue(input.amount) } : {}),
            ...(input.status !== undefined ? { status: input.status } : {})
        }
    });
}
