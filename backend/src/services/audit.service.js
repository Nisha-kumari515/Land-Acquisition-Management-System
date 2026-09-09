import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

export async function listAuditLogs(query = {}) {
    const limit = Number(query.limit ?? 25);
    const where = {
        ...(query.entity ? { entity: query.entity } : {}),
        ...(query.userId ? { userId: query.userId } : {})
    };

    return prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 25
    });
}

export async function getAuditTrail(entity, entityId) {
    const logs = await prisma.auditLog.findMany({
        where: { entity, entityId },
        orderBy: { createdAt: 'desc' }
    });

    if (logs.length === 0) {
        throw new AppError(404, 'AUDIT_NOT_FOUND', 'No audit entries found for this entity');
    }

    return logs;
}
