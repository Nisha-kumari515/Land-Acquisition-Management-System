import { prisma } from '../config/database.js';

function normalizeReasons(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [String(value)];
}

export async function getOverview() {
    const [
        totalProjects,
        activeProjects,
        totalParcels,
        affectedParcels,
        pendingCompensation,
        pendingRR,
        highRiskAlerts,
        projectStatusBreakdown,
        acquisitionStageBreakdown,
        recentAlerts
    ] = await prisma.$transaction([
        prisma.project.count(),
        prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma.parcel.count(),
        prisma.projectParcel.count(),
        prisma.compensation.count({ where: { status: 'PENDING' } }),
        prisma.rrFamily.count({ where: { status: 'PENDING' } }),
        prisma.riskAlert.count({ where: { level: 'HIGH' } }),
        prisma.project.groupBy({
            by: ['status'],
            _count: { _all: true }
        }),
        prisma.projectParcel.groupBy({
            by: ['acquisitionStage'],
            _count: { _all: true }
        }),
        prisma.riskAlert.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                project: { select: { code: true, name: true } },
                projectParcel: {
                    select: {
                        id: true,
                        acquisitionStage: true,
                        parcel: { select: { village: true, ulpin: true } }
                    }
                }
            }
        })
    ]);

    return {
        summary: {
            totalProjects,
            activeProjects,
            totalParcels,
            affectedParcels,
            pendingCompensation,
            pendingRR,
            highRiskAlerts
        },
        byStatus: projectStatusBreakdown.map((item) => ({
            status: item.status,
            count: item._count._all
        })),
        byAcquisitionStage: acquisitionStageBreakdown.map((item) => ({
            stage: item.acquisitionStage,
            count: item._count._all
        })),
        recentAlerts: recentAlerts.map((alert) => ({
            id: alert.id,
            level: alert.level,
            score: alert.score,
            reasons: normalizeReasons(alert.reasons),
            recommendedAction: alert.recommendedAction,
            createdAt: alert.createdAt,
            project: alert.project,
            projectParcel: alert.projectParcel
        }))
    };
}

export async function getProjectSummary() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            district: { select: { name: true } },
            _count: { select: { projectParcels: true } },
            projectParcels: {
                select: {
                    id: true,
                    acquisitionStage: true,
                    compensationStatus: true,
                    riskLevel: true,
                    parcel: { select: { village: true, ulpin: true } },
                    riskAlerts: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { level: true, score: true, reasons: true }
                    }
                }
            }
        }
    });

    return projects.map((project) => ({
        id: project.id,
        code: project.code,
        name: project.name,
        department: project.department,
        status: project.status,
        district: project.district?.name ?? null,
        parcelCount: project._count.projectParcels,
        riskSummary: {
            high: project.projectParcels.filter((entry) => entry.riskLevel === 'HIGH').length,
            medium: project.projectParcels.filter((entry) => entry.riskLevel === 'MEDIUM').length,
            low: project.projectParcels.filter((entry) => entry.riskLevel === 'LOW').length
        },
        latestRisk: project.projectParcels[0]?.riskAlerts[0] ?? null,
        stages: project.projectParcels.map((entry) => ({
            id: entry.id,
            acquisitionStage: entry.acquisitionStage,
            compensationStatus: entry.compensationStatus,
            riskLevel: entry.riskLevel,
            village: entry.parcel?.village ?? null,
            ulpin: entry.parcel?.ulpin ?? null,
            latestRisk: entry.riskAlerts[0] ? {
                level: entry.riskAlerts[0].level,
                score: entry.riskAlerts[0].score,
                reasons: normalizeReasons(entry.riskAlerts[0].reasons)
            } : null
        }))
    }));
}
