import { prisma } from '../config/database.js';
import { sendSuccess, AppError } from '../utils/response.js';

export async function getGeometry(req, res, next) {
    try {
        const id = req.params.id;
        const geometry = await prisma.$queryRaw`SELECT ST_AsGeoJSON(geometry)::json AS geojson FROM "Project" WHERE id = ${id}`;
        if (!geometry.length) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
        return sendSuccess(res, { id, geometry: geometry[0]?.geojson || null }, 'Project geometry retrieved');
    } catch (error) { return next(error); }
}

export async function updateGeometry(req, res, next) {
    try {
        const id = req.params.id;
        const { geojson } = req.body;
        
        if (!geojson || !geojson.type || !geojson.coordinates) {
            throw new AppError(400, 'INVALID_GEOMETRY', 'Invalid GeoJSON payload provided');
        }
        
        // Basic type validation
        const allowedTypes = ['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString'];
        if (!allowedTypes.includes(geojson.type)) {
            throw new AppError(400, 'INVALID_GEOMETRY', `Geometry type ${geojson.type} is not supported. Use Polygon, MultiPolygon, LineString, or MultiLineString.`);
        }

        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

        const prevGeometry = await prisma.$queryRaw`SELECT ST_AsGeoJSON(geometry)::json AS geojson FROM "Project" WHERE id = ${id}`;
        
        // Update in PostGIS
        const geometryStr = JSON.stringify(geojson);
        await prisma.$executeRaw`UPDATE "Project" SET geometry = ST_SetSRID(ST_GeomFromGeoJSON(${geometryStr}), 32646) WHERE id = ${id}`;
        
        // Audit
        await prisma.auditLog.create({
            data: {
                userId: req.user.sub,
                action: 'PROJECT_GEOMETRY_UPDATED',
                entity: 'PROJECT',
                entityId: id,
                previousValue: prevGeometry[0]?.geojson || null,
                newValue: geojson
            }
        });

        return sendSuccess(res, { id, geometry: geojson }, 'Project geometry updated');
    } catch (error) { return next(error); }
}

export async function deleteGeometry(req, res, next) {
    try {
        const id = req.params.id;
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

        const prevGeometry = await prisma.$queryRaw`SELECT ST_AsGeoJSON(geometry)::json AS geojson FROM "Project" WHERE id = ${id}`;

        await prisma.$executeRaw`UPDATE "Project" SET geometry = NULL WHERE id = ${id}`;

        await prisma.auditLog.create({
            data: {
                userId: req.user.sub,
                action: 'PROJECT_GEOMETRY_DELETED',
                entity: 'PROJECT',
                entityId: id,
                previousValue: prevGeometry[0]?.geojson || null,
                newValue: null
            }
        });

        return res.status(204).send();
    } catch (error) { return next(error); }
}
