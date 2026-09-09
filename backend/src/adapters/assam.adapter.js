import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';
import { getDagInfo } from '../clients/bhunaksha.client.js';
import { mapBhuNakshaParcel } from '../integrations/assam/bhunaksha.mapper.js';

function requiredText(value, fieldName) {
    if (!value || typeof value !== 'string' || !value.trim()) {
        throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} is required`);
    }
    return value.trim();
}

function isRetryable(error) {
    return [502, 504].includes(error.status) || ['ASSAM_API_UNAVAILABLE', 'ASSAM_API_ERROR', 'ASSAM_API_TIMEOUT'].includes(error.code);
}

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function dataStatusForTimestamp(timestamp, fallbackStatus) {
    if (!timestamp) return fallbackStatus;
    return Date.now() - new Date(timestamp).getTime() > env.assamStaleAfterMs ? 'STALE' : fallbackStatus;
}

async function getDagInfoWithRetry(input, options = {}) {
    const maxRetries = options.maxRetries ?? env.assamMaxRetries;
    const retryBaseDelayMs = options.retryBaseDelayMs ?? env.assamRetryBaseDelayMs;
    const sleep = options.sleep ?? wait;
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            return await getDagInfo({ ...input, fetchImpl: options.fetchImpl });
        } catch (error) {
            if (!isRetryable(error) || attempt === maxRetries) throw error;
            await sleep(retryBaseDelayMs * (2 ** attempt));
            attempt += 1;
        }
    }

    throw new AppError(502, 'ASSAM_API_UNAVAILABLE', 'Assam BhuNaksha is unavailable');
}

async function findLastSuccessfulSnapshot(sourceId) {
    return prisma.parcel.findUnique({
        where: { sourceSystem_sourceId: { sourceSystem: 'BHUNAKSHA', sourceId } },
        include: { state: true, district: true, owners: true }
    });
}

async function lastSuccessfulSync(dataSourceId) {
    return prisma.syncLog.findFirst({
        where: { dataSourceId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true }
    });
}


export async function syncAssamParcel(input, options = {}) {
    const locationCode = requiredText(input.locationCode, 'locationCode');
    const dagNo = requiredText(input.dagNo, 'dagNo');
    const sourceStartedAt = new Date();
    const dataSource = await prisma.dataSource.upsert({
        where: { name: 'BHUNAKSHA' },
        update: { description: 'Official Assam BhuNaksha parcel source' },
        create: { name: 'BHUNAKSHA', description: 'Official Assam BhuNaksha parcel source' }
    });

    try {
        const result = await getDagInfoWithRetry({ locationCode, dagNo }, options);
        const normalized = mapBhuNakshaParcel(result.payload, { ...input, locationCode, dagNo }, result.sourceMetadata);
        const state = await prisma.state.findUnique({ where: { code: normalized.stateCode } });
        const district = await prisma.district.findUnique({ where: { code: normalized.districtCode } });

        if (!state || !district || district.stateId !== state.id) {
            throw new AppError(422, 'ASSAM_GEOGRAPHY_NOT_CONFIGURED', 'Configured Assam state or district does not exist');
        }

        const parcel = await prisma.$transaction(async (transaction) => {
            const existingParcel = await transaction.parcel.findUnique({
                where: { sourceSystem_sourceId: { sourceSystem: normalized.sourceSystem, sourceId: normalized.sourceId } },
                select: { id: true }
            });
            const savedParcel = await transaction.parcel.upsert({
                where: { sourceSystem_sourceId: { sourceSystem: normalized.sourceSystem, sourceId: normalized.sourceId } },
                update: {
                    stateId: state.id,
                    districtId: district.id,
                    circle: normalized.circle,
                    village: normalized.village,
                    dagNo: normalized.dagNo,
                    pattaNo: normalized.pattaNo,
                    area: normalized.area,
                    dataOrigin: normalized.dataOrigin,
                    sourceUpdatedAt: normalized.sourceUpdatedAt,
                    lastSyncedAt: normalized.lastSyncedAt,
                    rawSourceMetadata: result.sourceMetadata,
                    rawSourcePayload: normalized.rawSourcePayload
                },
                create: {
                    stateId: state.id,
                    districtId: district.id,
                    circle: normalized.circle,
                    village: normalized.village,
                    dagNo: normalized.dagNo,
                    pattaNo: normalized.pattaNo,
                    area: normalized.area,
                    dataOrigin: normalized.dataOrigin,
                    sourceSystem: normalized.sourceSystem,
                    sourceId: normalized.sourceId,
                    sourceUpdatedAt: normalized.sourceUpdatedAt,
                    lastSyncedAt: normalized.lastSyncedAt,
                    rawSourceMetadata: result.sourceMetadata,
                    rawSourcePayload: normalized.rawSourcePayload
                },
                include: { state: true, district: true }
            });

            await transaction.parcelOwner.deleteMany({ where: { parcelId: savedParcel.id } });
            if (normalized.owners.length > 0) {
                await transaction.parcelOwner.createMany({
                    data: normalized.owners.map((owner) => ({ ...owner, parcelId: savedParcel.id }))
                });
            }

            await transaction.syncLog.create({
                data: {
                    dataSourceId: dataSource.id,
                    startedAt: sourceStartedAt,
                    completedAt: new Date(),
                    status: 'COMPLETED',
                    recordsRead: 1,
                    recordsWritten: 1,
                    recordsInserted: existingParcel ? 0 : 1,
                    recordsUpdated: existingParcel ? 1 : 0,
                    recordsRejected: 0,
                    recordsFailed: 0,
                    rawSnapshotRef: `${result.sourceMetadata.endpoint}?location=${encodeURIComponent(locationCode)}&dag_no=${encodeURIComponent(dagNo)}`
                }
            });

            return transaction.parcel.findUnique({
                where: { id: savedParcel.id },
                include: { state: true, district: true, owners: true }
            });
        });

        const successfulSync = await lastSuccessfulSync(dataSource.id);
        return {
            source: 'BHUNAKSHA',
            dataStatus: dataStatusForTimestamp(normalized.sourceUpdatedAt, 'FRESH'),
            syncStatus: 'COMPLETED',
            lastSyncedAt: successfulSync?.completedAt ?? parcel.lastSyncedAt,
            sourceMetadata: result.sourceMetadata,
            parcel: { ...parcel, dataOrigin: normalized.dataOrigin }
        };
    } catch (error) {
        await prisma.syncLog.create({
            data: {
                dataSourceId: dataSource.id,
                startedAt: sourceStartedAt,
                completedAt: new Date(),
                status: 'FAILED',
                recordsRead: 0,
                recordsWritten: 0,
                recordsInserted: 0,
                recordsUpdated: 0,
                recordsRejected: 0,
                recordsFailed: 1,
                errorMessage: error.message,
                rawSnapshotRef: `assam://official-api/BHUNAKSHA/${encodeURIComponent(locationCode)}/${encodeURIComponent(dagNo)}`
            }
        }).catch(() => undefined);

        const sourceId = `BHUNAKSHA:${locationCode}:${dagNo}`;
        const snapshot = await findLastSuccessfulSnapshot(sourceId);
        if (snapshot?.lastSyncedAt) {
            const successfulSync = await lastSuccessfulSync(dataSource.id);
            return {
                source: 'BHUNAKSHA',
                dataStatus: dataStatusForTimestamp(snapshot.lastSyncedAt, 'LOCAL_SNAPSHOT'),
                syncStatus: 'FAILED_USING_SNAPSHOT',
                lastSyncedAt: successfulSync?.completedAt ?? snapshot.lastSyncedAt,
                warning: 'Live source unavailable; displaying last successful snapshot.',
                error: { code: error.code, message: error.message },
                parcel: snapshot
            };
        }

        error.dataStatus = 'UNAVAILABLE';
        error.syncStatus = 'FAILED';
        throw error;
    }
}

export { dataStatusForTimestamp, getDagInfoWithRetry };
