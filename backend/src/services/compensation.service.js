import { CompensationStatus } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const compensationInclude = {
    acquisitionCase: {
        select: {
            id: true,
            currentStage: true,
            projectParcel: {
                select: {
                    id: true,
                    projectId: true,
                    parcelId: true,
                    project: { select: { code: true, name: true } },
                    parcel: { select: { ulpin: true, village: true, dagNo: true } }
                }
            }
        }
    }
};

const statuses = Object.values(CompensationStatus);

function parseAmount(value, field, { allowNull = false } = {}) {
    if (value === undefined || (value === null && allowNull)) return value;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
        throw new AppError(400, 'INVALID_AMOUNT', `${field} must be a non-negative number`);
    }
    return amount;
}

function parseDate(value, field) {
    if (value === undefined || value === null) return value ?? null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new AppError(400, 'INVALID_DATE', `${field} must be a valid date`);
    return date;
}

function validateStatus(status) {
    if (status !== undefined && !statuses.includes(status)) {
        throw new AppError(400, 'INVALID_COMPENSATION_STATUS', `status must be one of: ${statuses.join(', ')}`);
    }
}

function validateAmounts(assessedAmount, approvedAmount, paidAmount) {
    if (approvedAmount !== null && approvedAmount !== undefined && approvedAmount > assessedAmount) {
        throw new AppError(400, 'INVALID_AMOUNT', 'approvedAmount cannot exceed assessedAmount');
    }
    const paymentLimit = approvedAmount ?? assessedAmount;
    if (paidAmount > paymentLimit) {
        throw new AppError(400, 'INVALID_AMOUNT', 'paidAmount cannot exceed the approved or assessed amount');
    }
}

async function getCase(id, transaction = prisma) {
    const acquisitionCase = await transaction.acquisitionCase.findUnique({ where: { id } });
    if (!acquisitionCase) throw new AppError(404, 'ACQUISITION_CASE_NOT_FOUND', 'Acquisition case not found');
    return acquisitionCase;
}

export async function getCompensation(acquisitionCaseId) {
    await getCase(acquisitionCaseId);
    const compensation = await prisma.compensation.findUnique({
        where: { acquisitionCaseId },
        include: compensationInclude
    });
    if (!compensation) throw new AppError(404, 'COMPENSATION_NOT_FOUND', 'Compensation record not found');
    return compensation;
}

function compensationData(input, existing = {}) {
    const assessedAmount = parseAmount(input.assessedAmount ?? existing.assessedAmount, 'assessedAmount');
    const approvedAmount = parseAmount(input.approvedAmount ?? existing.approvedAmount, 'approvedAmount', { allowNull: true });
    const paidAmount = parseAmount(input.paidAmount ?? existing.paidAmount ?? 0, 'paidAmount');
    validateStatus(input.status);
    validateAmounts(assessedAmount, approvedAmount, paidAmount);

    const status = input.status ?? existing.status ?? CompensationStatus.PENDING;
    if (status === CompensationStatus.PAID && paidAmount <= 0) {
        throw new AppError(400, 'INVALID_COMPENSATION_STATUS', 'PAID status requires paidAmount greater than zero');
    }
    if (status === CompensationStatus.APPROVED && approvedAmount === null) {
        throw new AppError(400, 'INVALID_COMPENSATION_STATUS', 'APPROVED status requires approvedAmount');
    }

    return {
        assessedAmount,
        approvedAmount,
        paidAmount,
        status,
        assessmentDate: parseDate(input.assessmentDate ?? existing.assessmentDate, 'assessmentDate'),
        approvalDate: parseDate(input.approvalDate ?? existing.approvalDate, 'approvalDate'),
        paymentDate: parseDate(input.paymentDate ?? existing.paymentDate, 'paymentDate')
    };
}

export async function createCompensation(acquisitionCaseId, input) {
    await getCase(acquisitionCaseId);
    const existing = await prisma.compensation.findUnique({ where: { acquisitionCaseId } });
    if (existing) throw new AppError(409, 'COMPENSATION_EXISTS', 'Compensation record already exists');

    return prisma.$transaction(async (transaction) => {
        const compensation = await transaction.compensation.create({
            data: { acquisitionCaseId, ...compensationData(input) },
            include: compensationInclude
        });
        await transaction.projectParcel.update({
            where: { id: compensation.acquisitionCase.projectParcel.id },
            data: { compensationStatus: compensation.status }
        });
        return compensation;
    });
}

export async function updateCompensation(acquisitionCaseId, input) {
    const existing = await prisma.compensation.findUnique({ where: { acquisitionCaseId } });
    if (!existing) throw new AppError(404, 'COMPENSATION_NOT_FOUND', 'Compensation record not found');

    return prisma.$transaction(async (transaction) => {
        const compensation = await transaction.compensation.update({
            where: { acquisitionCaseId },
            data: compensationData(input, existing),
            include: compensationInclude
        });
        await transaction.projectParcel.update({
            where: { id: compensation.acquisitionCase.projectParcel.id },
            data: { compensationStatus: compensation.status }
        });
        return compensation;
    });
}
