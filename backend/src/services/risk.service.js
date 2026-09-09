import { RiskLevel } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const riskInclude = {
    project: {
        select: {
            id: true,
            code: true,
            name: true,
            status: true,
            startDate: true,
            targetDate: true
        }
    },
    projectParcel: {
        select: {
            id: true,
            projectId: true,
            parcelId: true,
            acquisitionStage: true,
            compensationStatus: true,
            rrStatus: true,
            riskLevel: true,
            project: {
                select: {
                    id: true,
                    code: true,
                    name: true
                }
            },
            parcel: {
                select: {
                    id: true,
                    village: true,
                    dagNo: true,
                    ulpin: true,
                    owners: {
                        select: {
                            id: true,
                            name: true,
                            ownershipPct: true,
                            isVerified: true
                        }
                    }
                }
            }
        }
    }
};

function clampScore(score) {
    return Math.min(100, Math.max(0, score));
}

function levelForScore(score) {
    if (score >= 70) return RiskLevel.HIGH;
    if (score >= 35) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
}

function daysBetween(dateValue) {
    if (!dateValue) return null;
    const milliseconds = Date.now() - new Date(dateValue).getTime();
    return milliseconds / (1000 * 60 * 60 * 24);
}

function recommendation(level) {
    if (level === RiskLevel.HIGH) {
        return 'Escalate to the district acquisition officer and initiate corrective action within 7 days.';
    }
    if (level === RiskLevel.MEDIUM) {
        return 'Schedule a verification review and corrective action with the field and finance teams.';
    }
    return 'Continue routine monitoring and review the parcel at the next milestone checkpoint.';
}

function buildRisk(projectParcel) {
    const reasons = [];
    let score = 0;

    const compensation = projectParcel.acquisitionCase?.compensation;
    const compensationAge = daysBetween(compensation?.assessmentDate ?? compensation?.createdAt);
    if (compensation && compensation.status === 'PENDING' && compensationAge !== null && compensationAge > 60) {
        reasons.push('Compensation pending for more than 60 days');
        score += 50;
    }

    const ownerCount = projectParcel.parcel?.owners?.length ?? 0;
    if (ownerCount > 1) {
        reasons.push('Multiple ownership records');
        score += 25;
    }

    const milestoneAge = daysBetween(projectParcel.acquisitionCase?.updatedAt ?? projectParcel.updatedAt);
    if (projectParcel.acquisitionStage !== 'COMPLETED' && milestoneAge !== null && milestoneAge > 90) {
        reasons.push('Acquisition milestone overdue');
        score += 50;
    }

    const rrStatus = projectParcel.rrStatus;
    if (rrStatus && ['PENDING', 'UNDER_REVIEW'].includes(rrStatus)) {
        reasons.push('Pending RR or objection review');
        score += 20;
    }

    if (projectParcel.acquisitionCase?.remarks && /objection|issue|dispute/i.test(projectParcel.acquisitionCase.remarks)) {
        reasons.push('Objection or pending issue flagged in case remarks');
        score += 15;
    }

    if (reasons.length === 0) {
        reasons.push('No material risk factors detected');
        score = 10;
    }

    const level = levelForScore(clampScore(score));
    return {
        level,
        score: clampScore(score),
        reasons,
        recommendedAction: recommendation(level)
    };
}

export async function listRiskAlerts(query = {}) {
    const where = {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.projectParcelId ? { projectParcelId: query.projectParcelId } : {}),
        ...(query.level ? { level: query.level } : {})
    };

    return prisma.riskAlert.findMany({
        where,
        include: riskInclude,
        orderBy: { createdAt: 'desc' }
    });
}

export async function getProjectRisk(projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

    const projectParcels = await prisma.projectParcel.findMany({
        where: { projectId },
        include: {
            acquisitionCase: {
                include: {
                    compensation: true,
                    history: { orderBy: { createdAt: 'desc' }, take: 1 }
                }
            },
            parcel: {
                include: { owners: true }
            },
            rrFamilies: true
        }
    });

    const evaluated = projectParcels.map((projectParcel) => {
        const parcel = projectParcel.parcel;
        const result = buildRisk({
            ...projectParcel,
            acquisitionCase: projectParcel.acquisitionCase,
            parcel,
            rrStatus: projectParcel.rrStatus ?? (projectParcel.rrFamilies.length ? 'PENDING' : null)
        });
        return {
            projectParcelId: projectParcel.id,
            parcelId: projectParcel.parcelId,
            village: parcel?.village ?? null,
            ulpin: parcel?.ulpin ?? null,
            ...result
        };
    });

    const highest = evaluated.reduce((max, item) => (item.score > max.score ? item : max), evaluated[0] ?? { score: 0, level: RiskLevel.LOW, reasons: ['No rows'], recommendedAction: recommendation(RiskLevel.LOW) });

    return {
        projectId,
        projectCode: project.code,
        projectName: project.name,
        summary: {
            total: evaluated.length,
            high: evaluated.filter((item) => item.level === RiskLevel.HIGH).length,
            medium: evaluated.filter((item) => item.level === RiskLevel.MEDIUM).length,
            low: evaluated.filter((item) => item.level === RiskLevel.LOW).length,
            maxScore: highest.score,
            maxLevel: highest.level
        },
        risks: evaluated
    };
}

export async function evaluateProjectParcel(projectParcelId) {
    const projectParcel = await prisma.projectParcel.findUnique({
        where: { id: projectParcelId },
        include: {
            project: true,
            parcel: { include: { owners: true } },
            acquisitionCase: {
                include: {
                    compensation: true,
                    history: { orderBy: { createdAt: 'desc' }, take: 1 }
                }
            }
        }
    });

    if (!projectParcel) {
        throw new AppError(404, 'PROJECT_PARCEL_NOT_FOUND', 'Project-parcel relationship not found');
    }

    const evaluation = buildRisk(projectParcel);
    const existingAlert = await prisma.riskAlert.findFirst({
        where: { projectParcelId },
        orderBy: { createdAt: 'desc' }
    });

    const alert = existingAlert
        ? await prisma.riskAlert.update({
            where: { id: existingAlert.id },
            data: {
                level: evaluation.level,
                score: evaluation.score,
                reasons: evaluation.reasons,
                recommendedAction: evaluation.recommendedAction,
                resolvedAt: null
            },
            include: riskInclude
        })
        : await prisma.riskAlert.create({
            data: {
                projectId: projectParcel.projectId,
                projectParcelId,
                level: evaluation.level,
                score: evaluation.score,
                reasons: evaluation.reasons,
                recommendedAction: evaluation.recommendedAction
            },
            include: riskInclude
        });

    await prisma.projectParcel.update({
        where: { id: projectParcelId },
        data: { riskLevel: evaluation.level }
    });

    return {
        projectId: projectParcel.projectId,
        projectParcelId,
        ...evaluation,
        alert
    };
}
