import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const notificationInclude = {
    project: { select: { id: true, code: true, name: true } },
    parcel: { select: { id: true, village: true, dagNo: true, ulpin: true } },
    riskAlert: { select: { id: true, level: true, score: true } },
    syncLog: { select: { id: true, status: true, startedAt: true, completedAt: true } }
};

async function ensureGeneratedNotifications() {
    const generated = [];
    const overdueCases = await prisma.acquisitionCase.findMany({
        where: { currentStage: { not: 'COMPLETED' }, updatedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        select: { id: true, projectParcel: { select: { projectId: true, parcelId: true, project: { select: { name: true } } } } }
    });
    for (const item of overdueCases) generated.push({
        eventKey: `OVERDUE_ACQUISITION:${item.id}`,
        type: 'OVERDUE_ACQUISITION_MILESTONE', title: 'Acquisition milestone overdue',
        message: `Acquisition case for ${item.projectParcel.project.name} has not advanced in 90 days.`,
        projectId: item.projectParcel.projectId, parcelId: item.projectParcel.parcelId, acquisitionCaseId: item.id
    });

    const delayedCompensation = await prisma.compensation.findMany({
        where: { status: { in: ['PENDING', 'ASSESSED'] }, assessmentDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { acquisitionCaseId: true, acquisitionCase: { select: { projectParcel: { select: { projectId: true, parcelId: true } } } } }
    });
    for (const item of delayedCompensation) generated.push({
        eventKey: `COMPENSATION_DELAY:${item.acquisitionCaseId}`,
        type: 'COMPENSATION_DELAY', title: 'Compensation payment delayed', message: 'Compensation has remained pending for more than 30 days.',
        projectId: item.acquisitionCase.projectParcel.projectId, parcelId: item.acquisitionCase.projectParcel.parcelId, acquisitionCaseId: item.acquisitionCaseId
    });

    const risks = await prisma.riskAlert.findMany({ where: { level: 'HIGH', resolvedAt: null }, select: { id: true, projectId: true, projectParcelId: true, projectParcel: { select: { parcelId: true } } } });
    for (const risk of risks) generated.push({
        eventKey: `HIGH_RISK:${risk.id}`, type: risk.projectParcelId ? 'HIGH_RISK_PARCEL' : 'HIGH_RISK_PROJECT',
        title: risk.projectParcelId ? 'High-risk parcel requires review' : 'High-risk project requires review', message: 'An unresolved high-risk alert requires attention.',
        projectId: risk.projectId, parcelId: risk.projectParcel?.parcelId ?? null, riskAlertId: risk.id
    });

    const failedSyncs = await prisma.syncLog.findMany({ where: { status: 'FAILED' }, orderBy: { startedAt: 'desc' }, take: 50, select: { id: true, dataSourceId: true, errorMessage: true } });
    for (const sync of failedSyncs) generated.push({
        eventKey: `FAILED_SYNC:${sync.id}`, type: 'FAILED_INTEGRATION_SYNC', title: 'Integration synchronization failed', message: sync.errorMessage || 'An external integration synchronization failed.', syncLogId: sync.id
    });

    const staleSources = await prisma.dataSource.findMany({ select: { id: true, name: true, syncLogs: { where: { status: 'COMPLETED' }, orderBy: { completedAt: 'desc' }, take: 1, select: { id: true, completedAt: true } } } });
    for (const source of staleSources) {
        if (!source.syncLogs[0]?.completedAt || Date.now() - source.syncLogs[0].completedAt.getTime() > 24 * 60 * 60 * 1000) generated.push({
            eventKey: `STALE_SOURCE:${source.id}`, type: 'STALE_EXTERNAL_DATA', title: 'External data is stale', message: `${source.name} has not completed a successful sync in the last 24 hours.`, syncLogId: source.syncLogs[0]?.id ?? null
        });
    }
    for (const notification of generated) {
        await prisma.notification.upsert({ where: { eventKey: notification.eventKey }, update: { message: notification.message }, create: notification });
    }
}

export async function listNotifications(query = {}) {
    await ensureGeneratedNotifications();
    return prisma.notification.findMany({ where: query.unread === 'true' ? { readAt: null } : undefined, include: notificationInclude, orderBy: { createdAt: 'desc' }, take: 100 });
}

export async function markRead(id) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() }, include: notificationInclude });
}

export async function markAllRead() {
    await ensureGeneratedNotifications();
    const result = await prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
    return { updated: result.count };
}