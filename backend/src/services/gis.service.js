import { prisma } from '../config/database.js';
import { validateProjectGeometry, normalizeSpatialResult } from '../utils/geometry.js';
import { AppError } from '../utils/response.js';

export async function analyzeProjectImpact(projectId, input) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

    const srid = Number.parseInt(input.srid ?? '', 10);
    const { geometry } = validateProjectGeometry(input.geometry, srid);
    const geometryJson = JSON.stringify(geometry);

    const parcelSrids = await prisma.$queryRaw`
        SELECT DISTINCT ST_SRID(geometry)::int AS srid
        FROM "Parcel"
        WHERE geometry IS NOT NULL
    `;
    if (parcelSrids.length > 0 && !parcelSrids.some((row) => row.srid === srid)) {
        throw new AppError(400, 'INVALID_SRID', `No parcel geometry is stored with SRID ${srid}`);
    }

    const affectedParcels = await prisma.$transaction(async (transaction) => {
        await transaction.$executeRaw`
            UPDATE "Project"
            SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), ${srid}::int)
            WHERE id = ${projectId}
        `;

        const intersections = await transaction.$queryRaw`
            WITH input_geometry AS (
                SELECT ST_SetSRID(ST_GeomFromGeoJSON(${geometryJson}), ${srid}::int) AS geom
            )
            SELECT
                p.id AS parcel_id,
                p."dagNo",
                p."village",
                p.area::text AS total_area,
                ST_Area(ST_Intersection(p.geometry, input_geometry.geom))::text AS affected_area,
                ROUND(
                    (
                        ST_Area(ST_Intersection(p.geometry, input_geometry.geom))
                        / NULLIF(p.area::numeric, 0) * 100
                    )::numeric,
                    2
                )::text AS affected_percentage
            FROM "Parcel" p
            CROSS JOIN input_geometry
            WHERE p.geometry IS NOT NULL
              AND ST_SRID(p.geometry) = ${srid}
              AND ST_Intersects(p.geometry, input_geometry.geom)
        `;

        for (const row of intersections) {
            await transaction.projectParcel.upsert({
                where: { projectId_parcelId: { projectId, parcelId: row.parcel_id } },
                create: {
                    projectId,
                    parcelId: row.parcel_id,
                    affectedArea: Number(row.affected_area),
                    affectedPercentage: Number(row.affected_percentage)
                },
                update: {
                    affectedArea: Number(row.affected_area),
                    affectedPercentage: Number(row.affected_percentage)
                }
            });
        }

        return intersections.map(normalizeSpatialResult);
    });

    return {
        projectId,
        srid,
        affectedParcels: affectedParcels.length,
        totalAffectedArea: affectedParcels.reduce((total, parcel) => total + parcel.affectedArea, 0),
        parcels: affectedParcels
    };
}
