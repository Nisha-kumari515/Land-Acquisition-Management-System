import { AcquisitionStage } from '@prisma/client';
import { prisma } from '../config/database.js';
import { acquisitionStages, validStageTransitions } from '../constants/acquisition-stages.js';
import { AppError } from '../utils/response.js';

const caseInclude = {
    projectParcel: {
        include: {
            project: { select: { id: true, code: true, name: true } },
            parcel: { select: { id: true, ulpin: true, village: true, dagNo: true, pattaNo: true } }
        }
    },
    history: {
        orderBy: { createdAt: 'asc' },
        include: { changedBy: { select: { id: true, name: true, email: true } } }
    },
    notifications: true,
    award: true,
    compensation: true
};

function assertStage(stage) {
    if (!acquisitionStages.includes(stage)) {
        throw new AppError(400, 'INVALID_ACQUISITION_STAGE', `stage must be one of: ${acquisitionStages.join(', ')}`);
    }
}

async function getCase(id, transaction = prisma) {
    const acquisitionCase = await transaction.acquisitionCase.findUnique({
        where: { id },
        include: caseInclude
    });
    if (!acquisitionCase) throw new AppError(404, 'ACQUISITION_CASE_NOT_FOUND', 'Acquisition case not found');
    return acquisitionCase;
}

async function assertChanger(changedById, transaction) {
    const user = await transaction.user.findUnique({ where: { id: changedById } });
    if (!user || !user.isActive) throw new AppError(400, 'INVALID_CHANGED_BY', 'changedById must reference an active user');
}

export async function getCasesByParcel(parcelId) {
    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) throw new AppError(404, 'PARCEL_NOT_FOUND', 'Parcel not found');

    return prisma.acquisitionCase.findMany({
        where: { projectParcel: { parcelId } },
        include: caseInclude,
        orderBy: { createdAt: 'desc' }
    });
}

export async function transitionStage(id, input) {
    const newStage = input.newStage;
    assertStage(newStage);
    if (!input.changedById) throw new AppError(400, 'VALIDATION_ERROR', 'changedById is required until authentication is enabled');

    return prisma.$transaction(async (transaction) => {
        const currentCase = await getCase(id, transaction);
        await assertChanger(input.changedById, transaction);

        const expectedNextStage = validStageTransitions.get(currentCase.currentStage);
        if (expectedNextStage !== newStage) {
            throw new AppError(
                422,
                'INVALID_STAGE_TRANSITION',
                `Cannot move from ${currentCase.currentStage} to ${newStage}; expected ${expectedNextStage ?? 'no further stage'}`
            );
        }

        const updatedCase = await transaction.acquisitionCase.update({
            where: { id },
            data: {
                currentStage: newStage,
                remarks: input.remarks ?? currentCase.remarks
            }
        });
        await transaction.projectParcel.update({
            where: { id: currentCase.projectParcelId },
            data: { acquisitionStage: newStage }
        });
        await transaction.acquisitionStageHistory.create({
            data: {
                acquisitionCaseId: id,
                previousStage: currentCase.currentStage,
                newStage,
                changedById: input.changedById,
                remarks: input.remarks ?? null
            }
        });

        return getCase(updatedCase.id, transaction);
    });
}

export { AcquisitionStage };
