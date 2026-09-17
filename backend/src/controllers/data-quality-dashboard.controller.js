import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getQualityDashboard(request, response, next) {
    try {
        const [
            totalRecords,
            missingDag,
            missingVillage,
            missingGeometry,
            invalidGeometry,
            duplicateGeometry,
            missingSourceIdentity,
            invalidArea,
            staleTimestamp
        ] = await Promise.all([
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel"`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "dagNo" IS NULL OR "dagNo" = ''`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "village" IS NULL OR "village" = ''`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "geometry" IS NULL`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "geometry" IS NOT NULL AND ST_IsValid("geometry") = false`,
            prisma.$queryRaw`
                SELECT COUNT(*)::int AS count FROM (
                    SELECT geometry FROM "Parcel" WHERE geometry IS NOT NULL GROUP BY geometry HAVING COUNT(*) > 1
                ) AS duplicates
            `,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "sourceId" IS NULL OR "sourceSystem" IS NULL`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "area" IS NULL OR "area" <= 0`,
            prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Parcel" WHERE "sourceTimestamp" < NOW() - INTERVAL '90 days'`
        ]);

        const stats = {
            totalRecords: totalRecords[0]?.count || 0,
            issues: {
                missingDag: missingDag[0]?.count || 0,
                missingVillage: missingVillage[0]?.count || 0,
                missingGeometry: missingGeometry[0]?.count || 0,
                invalidGeometry: invalidGeometry[0]?.count || 0,
                duplicateGeometry: duplicateGeometry[0]?.count || 0,
                missingSourceIdentity: missingSourceIdentity[0]?.count || 0,
                invalidArea: invalidArea[0]?.count || 0,
                staleTimestamp: staleTimestamp[0]?.count || 0
            }
        };

        const totalIssues = Object.values(stats.issues).reduce((a, b) => a + b, 0);
        stats.validRecords = Math.max(0, stats.totalRecords - totalIssues); // simplified approximation
        stats.errors = stats.issues.invalidGeometry + stats.issues.missingGeometry + stats.issues.missingSourceIdentity;
        stats.warnings = stats.issues.missingDag + stats.issues.missingVillage + stats.issues.invalidArea + stats.issues.staleTimestamp;

        return sendSuccess(response, stats, 'Data quality dashboard metrics retrieved');
    } catch (error) { return next(error); }
}
