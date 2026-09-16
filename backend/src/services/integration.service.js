import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

const dataSourceInclude = {
    syncLogs: {
        orderBy: { startedAt: 'desc' },
        take: 10
    }
};

const syncLogSelect = {
    id: true,
    dataSourceId: true,
    startedAt: true,
    completedAt: true,
    status: true,
    recordsRead: true,
    recordsWritten: true,
    recordsInserted: true,
    recordsUpdated: true,
    recordsRejected: true,
    recordsFailed: true,
    errorMessage: true,
    createdAt: true,
    dataSource: { select: { id: true, name: true, description: true } }
};

function freshnessStatus(lastSuccessfulAt, latestStatus) {
    if (!lastSuccessfulAt) return 'UNAVAILABLE';
    if (latestStatus !== 'COMPLETED') return 'STALE';
    return Date.now() - new Date(lastSuccessfulAt).getTime() > env.assamStaleAfterMs ? 'STALE' : 'FRESH';
}

function connectionStatus(lastSuccessfulAt, latestStatus) {
    if (!lastSuccessfulAt) return 'UNAVAILABLE';
    return latestStatus === 'COMPLETED' ? 'CONNECTED' : 'DEGRADED';
}

function errorInfo(log) {
    if (!log?.errorMessage) return null;
    return { code: log.status, message: log.errorMessage.slice(0, 500), occurredAt: log.startedAt };
}

function monitoringSummary(dataSource, aggregates) {
    const latestAttempt = aggregates.latestAttempt;
    const latestSuccess = aggregates.latestSuccess;
    const latestStatus = latestAttempt?.status ?? null;
    const lastSuccessfulAt = latestSuccess?.completedAt ?? null;

    return {
        id: dataSource.id,
        sourceSystem: dataSource.name,
        description: dataSource.description,
        connectionStatus: connectionStatus(lastSuccessfulAt, latestStatus),
        lastSuccessfulSync: lastSuccessfulAt,
        lastAttemptedSync: latestAttempt?.startedAt ?? null,
        recordsFetched: aggregates.totals._sum.recordsRead ?? 0,
        inserted: aggregates.totals._sum.recordsInserted ?? 0,
        updated: aggregates.totals._sum.recordsUpdated ?? 0,
        rejected: aggregates.totals._sum.recordsRejected ?? 0,
        failed: aggregates.totals._sum.recordsFailed ?? 0,
        freshnessStatus: freshnessStatus(lastSuccessfulAt, latestStatus),
        error: errorInfo(latestStatus === 'COMPLETED' ? null : latestAttempt)
    };
}

async function aggregateDataSource(dataSource) {
    const [totals, latestAttempt, latestSuccess] = await Promise.all([
        prisma.syncLog.aggregate({
            where: { dataSourceId: dataSource.id },
            _sum: { recordsRead: true, recordsInserted: true, recordsUpdated: true, recordsRejected: true, recordsFailed: true }
        }),
        prisma.syncLog.findFirst({ where: { dataSourceId: dataSource.id }, orderBy: { startedAt: 'desc' }, select: syncLogSelect }),
        prisma.syncLog.findFirst({ where: { dataSourceId: dataSource.id, status: 'COMPLETED' }, orderBy: { completedAt: 'desc' }, select: { completedAt: true } })
    ]);

    return monitoringSummary(dataSource, { totals, latestAttempt, latestSuccess });
}

function validateName(value) {
    if (!value || typeof value !== 'string' || !value.trim()) {
        throw new AppError(400, 'VALIDATION_ERROR', 'name is required');
    }
    return value.trim();
}

export async function listIntegrations() {
    const dataSources = await prisma.dataSource.findMany({ orderBy: { createdAt: 'desc' } });
    return Promise.all(dataSources.map(aggregateDataSource));
}

export async function getAssamStatus() {
    const dataSource = await prisma.dataSource.findUnique({ where: { name: 'BHUNAKSHA' } });
    if (!dataSource) {
        return {
            sourceSystem: 'BHUNAKSHA',
            connectionStatus: 'UNAVAILABLE',
            lastSuccessfulSync: null,
            lastAttemptedSync: null,
            recordsFetched: 0,
            inserted: 0,
            updated: 0,
            rejected: 0,
            failed: 0,
            freshnessStatus: 'UNAVAILABLE',
            error: null
        };
    }
    return aggregateDataSource(dataSource);
}

export async function listAllSyncLogs(query = {}) {
    const logs = await prisma.syncLog.findMany({
        where: query.dataSourceId ? { dataSourceId: query.dataSourceId } : undefined,
        orderBy: { startedAt: 'desc' },
        take: Math.min(Math.max(Number.parseInt(query.limit ?? '100', 10), 1), 100),
        select: syncLogSelect
    });
    return logs;
}

export async function getSyncLog(id) {
    const log = await prisma.syncLog.findUnique({ where: { id }, select: syncLogSelect });
    if (!log) throw new AppError(404, 'SYNC_LOG_NOT_FOUND', 'Sync log not found');
    return log;
}

export async function getIntegration(id) {
    const integration = await prisma.dataSource.findUnique({
        where: { id },
        include: dataSourceInclude
    });

    if (!integration) {
        throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Data source not found');
    }

    return integration;
}

export async function createIntegration(input) {
    const name = validateName(input.name);
    const description = input.description ?? null;

    return prisma.dataSource.create({
        data: {
            name,
            description
        },
        include: {
            _count: { select: { syncLogs: true } }
        }
    });
}

export async function listSyncLogs(dataSourceId) {
    const integration = await getIntegration(dataSourceId);
    return integration.syncLogs;
}

export async function syncIntegration(dataSourceId, input = {}) {
    const integration = await prisma.dataSource.findUnique({ where: { id: dataSourceId } });
    if (!integration) {
        throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Data source not found');
    }

    const startedAt = new Date();
    const defaultReadCount = await prisma.parcel.count({ where: { sourceSystem: integration.name } });
    const recordsRead = Number(input.recordsRead ?? defaultReadCount ?? 0);
    const recordsWritten = Number(input.recordsWritten ?? recordsRead);

    return prisma.syncLog.create({
        data: {
            dataSourceId,
            startedAt,
            completedAt: new Date(),
            status: 'COMPLETED',
            recordsRead,
            recordsWritten,
            recordsInserted: Number(input.recordsInserted ?? recordsWritten),
            recordsUpdated: Number(input.recordsUpdated ?? 0),
            recordsRejected: Number(input.recordsRejected ?? 0),
            recordsFailed: Number(input.recordsFailed ?? 0),
            errorMessage: input.errorMessage ?? null,
            rawSnapshotRef: input.rawSnapshotRef ?? `assam://demo/${integration.name.toLowerCase()}/${startedAt.toISOString()}`
        },
        include: {
            dataSource: { select: { id: true, name: true, description: true } }
        }
    });
}
