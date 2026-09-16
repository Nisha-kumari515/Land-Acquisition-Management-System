import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';

export async function getDashboardAnalytics(type = 'national', id = null) {
    let projectFilter = Prisma.sql`1=1`;
    let parcelFilter = Prisma.sql`1=1`;
    let compFilter = Prisma.sql`1=1`;
    let rrFilter = Prisma.sql`1=1`;

    if (type === 'state') {
        projectFilter = Prisma.sql`p."stateId" = ${id}`;
        parcelFilter = Prisma.sql`pp."projectId" IN (SELECT id FROM "Project" WHERE "stateId" = ${id})`;
        compFilter = Prisma.sql`"acquisitionCaseId" IN (SELECT id FROM "AcquisitionCase" WHERE "projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "stateId" = ${id})))`;
        rrFilter = Prisma.sql`"projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "stateId" = ${id}))`;
    } else if (type === 'district') {
        projectFilter = Prisma.sql`p."districtId" = ${id}`;
        parcelFilter = Prisma.sql`pp."projectId" IN (SELECT id FROM "Project" WHERE "districtId" = ${id})`;
        compFilter = Prisma.sql`"acquisitionCaseId" IN (SELECT id FROM "AcquisitionCase" WHERE "projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "districtId" = ${id})))`;
        rrFilter = Prisma.sql`"projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "districtId" = ${id}))`;
    } else if (type === 'project') {
        projectFilter = Prisma.sql`p.id = ${id}`;
        parcelFilter = Prisma.sql`pp."projectId" = ${id}`;
        compFilter = Prisma.sql`"acquisitionCaseId" IN (SELECT id FROM "AcquisitionCase" WHERE "projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" = ${id}))`;
        rrFilter = Prisma.sql`"projectParcelId" IN (SELECT id FROM "ProjectParcel" WHERE "projectId" = ${id})`;
    }

    const [
        stageDistribution,
        compensationDistribution,
        rrStatus,
        riskDistribution,
        monthlyTrend,
        monthlyCompensation,
        stateProgress,
        districtLand,
        bottlenecks,
        avgTime
    ] = await Promise.all([
        prisma.$queryRaw`SELECT "acquisitionStage"::text AS stage, COUNT(*)::int AS count FROM "ProjectParcel" pp WHERE ${parcelFilter} GROUP BY "acquisitionStage" ORDER BY count DESC`,
        prisma.$queryRaw`SELECT "compensationStatus"::text AS status, COUNT(*)::int AS count FROM "ProjectParcel" pp WHERE ${parcelFilter} GROUP BY "compensationStatus" ORDER BY count DESC`,
        prisma.$queryRaw`SELECT status, COUNT(*)::int AS count FROM "RrFamily" WHERE ${rrFilter} GROUP BY status ORDER BY count DESC`,
        prisma.$queryRaw`SELECT "riskLevel"::text AS level, COUNT(*)::int AS count FROM "ProjectParcel" pp WHERE ${parcelFilter} GROUP BY "riskLevel" ORDER BY count DESC`,
        prisma.$queryRaw`SELECT to_char(date_trunc('month', "updatedAt"), 'YYYY-MM') AS month, COUNT(*)::int AS progressed FROM "ProjectParcel" pp WHERE ${parcelFilter} GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw`SELECT to_char(date_trunc('month', COALESCE("paymentDate", "assessmentDate", "createdAt")), 'YYYY-MM') AS month, COUNT(*)::int AS cases, COALESCE(SUM("paidAmount"), 0)::text AS paid FROM "Compensation" WHERE ${compFilter} GROUP BY 1 ORDER BY 1`,
        prisma.$queryRaw`SELECT s.code, s.name, COUNT(pp.id)::int AS affected_parcels, COUNT(*) FILTER (WHERE pp."acquisitionStage" = 'COMPLETED')::int AS completed FROM "State" s LEFT JOIN "Project" p ON p."stateId" = s.id LEFT JOIN "ProjectParcel" pp ON pp."projectId" = p.id WHERE ${projectFilter} GROUP BY s.code, s.name ORDER BY s.name`,
        prisma.$queryRaw`SELECT d.code, d.name, SUM(pp."affectedArea")::text AS total_area FROM "District" d LEFT JOIN "Project" p ON p."districtId" = d.id LEFT JOIN "ProjectParcel" pp ON pp."projectId" = p.id WHERE ${projectFilter} GROUP BY d.code, d.name ORDER BY d.name`,
        prisma.$queryRaw`SELECT p.id, p.code, p.name, COUNT(pp.id)::int AS affected_parcels, COUNT(*) FILTER (WHERE pp."riskLevel" = 'HIGH')::int AS high_risk FROM "Project" p JOIN "ProjectParcel" pp ON pp."projectId" = p.id WHERE ${projectFilter} GROUP BY p.id, p.code, p.name HAVING COUNT(*) FILTER (WHERE pp."riskLevel" = 'HIGH') > 0 OR COUNT(pp.id) > 20 ORDER BY high_risk DESC, affected_parcels DESC LIMIT 20`,
        prisma.$queryRaw`SELECT AVG(EXTRACT(EPOCH FROM (pp."possessionDate" - pp."createdAt")))/86400 AS avg_days FROM "ProjectParcel" pp WHERE pp."acquisitionStage" = 'COMPLETED' AND ${parcelFilter}`
    ]);

    return {
        summary: {},
        stageDistribution,
        compensationDistribution,
        rrStatus,
        riskDistribution,
        monthlyTrend,
        monthlyCompensation,
        stateProgress,
        districtLand,
        bottlenecks,
        avgTime: avgTime[0]?.avg_days || null
    };
}

export async function getAnalytics() {
    return getDashboardAnalytics('national');
}