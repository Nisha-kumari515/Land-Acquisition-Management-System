import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getImpactSummary(req, res, next) {
    try {
        const id = req.params.projectId;

        const [
            impact, 
            districtDistribution,
            villageDistribution
        ] = await Promise.all([
            prisma.$queryRaw`
                SELECT 
                    COUNT(pp.id)::int AS "affectedParcelCount", 
                    COALESCE(SUM(pp."affectedArea"), 0)::text AS "totalAffectedArea"
                FROM "ProjectParcel" pp
                WHERE pp."projectId" = ${id}
            `,
            prisma.$queryRaw`
                SELECT d.name AS district, COUNT(pp.id)::int AS count
                FROM "ProjectParcel" pp
                JOIN "Parcel" p ON p.id = pp."parcelId"
                JOIN "District" d ON d.id = p."districtId"
                WHERE pp."projectId" = ${id}
                GROUP BY d.name
            `,
            prisma.$queryRaw`
                SELECT p.village, COUNT(pp.id)::int AS count
                FROM "ProjectParcel" pp
                JOIN "Parcel" p ON p.id = pp."parcelId"
                WHERE pp."projectId" = ${id}
                GROUP BY p.village
            `
        ]);

        return sendSuccess(res, {
            affectedParcelCount: impact[0]?.affectedParcelCount || 0,
            totalAffectedArea: impact[0]?.totalAffectedArea || 0,
            districtDistribution,
            villageDistribution
        }, 'Project impact summary retrieved');
    } catch (error) { return next(error); }
}
