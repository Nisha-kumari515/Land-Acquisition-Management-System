import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getMapParcels(request, response, next) {
    try {
        const { bbox } = request.query;
        if (!bbox) return sendSuccess(response, { type: 'FeatureCollection', features: [] });

        const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);

        const parcels = await prisma.$queryRaw`
            SELECT id, ulpin, village, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
            FROM "Parcel"
            WHERE ST_Intersects(geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
            LIMIT 500
        `;

        const features = parcels.map((p) => ({
            type: 'Feature',
            geometry: p.geometry,
            properties: { id: p.id, ulpin: p.ulpin, village: p.village }
        }));

        return sendSuccess(response, { type: 'FeatureCollection', features }, 'Map parcels retrieved');
    } catch (error) { return next(error); }
}

export async function getMapProjects(request, response, next) {
    try {
        const { bbox } = request.query;
        if (!bbox) return sendSuccess(response, { type: 'FeatureCollection', features: [] });

        const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);

        const projects = await prisma.$queryRaw`
            SELECT id, name, department, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
            FROM "Project"
            WHERE ST_Intersects(geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
            LIMIT 500
        `;

        const features = projects.map((p) => ({
            type: 'Feature',
            geometry: p.geometry,
            properties: { id: p.id, name: p.name, department: p.department }
        }));

        return sendSuccess(response, { type: 'FeatureCollection', features }, 'Map projects retrieved');
    } catch (error) { return next(error); }
}

export async function getMapAffectedParcels(request, response, next) {
    try {
        const { bbox } = request.query;
        if (!bbox) return sendSuccess(response, { type: 'FeatureCollection', features: [] });

        const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);

        const affected = await prisma.$queryRaw`
            SELECT p.id, p.ulpin, pp."acquisitionStage", pp."riskLevel", ST_AsGeoJSON(ST_Transform(p.geometry, 4326))::json AS geometry
            FROM "ProjectParcel" pp
            JOIN "Parcel" p ON pp."parcelId" = p.id
            WHERE ST_Intersects(p.geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
            LIMIT 500
        `;

        const features = affected.map((a) => ({
            type: 'Feature',
            geometry: a.geometry,
            properties: { id: a.id, ulpin: a.ulpin, acquisitionStage: a.acquisitionStage, riskLevel: a.riskLevel }
        }));

        return sendSuccess(response, { type: 'FeatureCollection', features }, 'Affected parcels retrieved');
    } catch (error) { return next(error); }
}
