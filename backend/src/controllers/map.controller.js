import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getMapParcels(request, response, next) {
    try {
        const { bbox, village } = request.query;
        let parcels = [];
        
        if (bbox) {
            const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
            parcels = await prisma.$queryRaw`
                SELECT id, ulpin, village, "dagNo", "pattaNo", area, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
                FROM "Parcel"
                WHERE geometry IS NOT NULL AND ST_Intersects(geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
                LIMIT 1500
            `;
        } else if (village) {
            parcels = await prisma.$queryRaw`
                SELECT id, ulpin, village, "dagNo", "pattaNo", area, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
                FROM "Parcel"
                WHERE geometry IS NOT NULL AND "village" = ${village}
                LIMIT 1500
            `;
        } else {
             // Fallback default village for demo purposes if no bbox is provided
             parcels = await prisma.$queryRaw`
                SELECT id, ulpin, village, "dagNo", "pattaNo", area, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
                FROM "Parcel"
                WHERE geometry IS NOT NULL AND "village" = '16111059'
                LIMIT 1500
            `;
        }

        const features = parcels.map((p) => ({
            type: 'Feature',
            geometry: p.geometry,
            properties: { id: p.id, ulpin: p.ulpin, village: p.village, dagNo: p.dagNo, pattaNo: p.pattaNo, area: p.area }
        }));

        return sendSuccess(response, { type: 'FeatureCollection', features }, 'Map parcels retrieved');
    } catch (error) { return next(error); }
}

export async function getMapProjects(request, response, next) {
    try {
        const { bbox } = request.query;
        let projects = [];
        if (bbox) {
            const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
            projects = await prisma.$queryRaw`
                SELECT id, name, department, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
                FROM "Project"
                WHERE geometry IS NOT NULL AND ST_Intersects(geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
                LIMIT 500
            `;
        } else {
            projects = await prisma.$queryRaw`
                SELECT id, name, department, ST_AsGeoJSON(ST_Transform(geometry, 4326))::json AS geometry
                FROM "Project"
                WHERE geometry IS NOT NULL
                LIMIT 500
            `;
        }

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
        let affected = [];
        if (bbox) {
            const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
            affected = await prisma.$queryRaw`
                SELECT p.id, p.ulpin, p."dagNo", p."pattaNo", p.area, pp."acquisitionStage", pp."riskLevel", ST_AsGeoJSON(ST_Transform(p.geometry, 4326))::json AS geometry
                FROM "ProjectParcel" pp
                JOIN "Parcel" p ON pp."parcelId" = p.id
                WHERE p.geometry IS NOT NULL AND ST_Intersects(p.geometry, ST_Transform(ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, 4326), 32646))
                LIMIT 500
            `;
        } else {
            affected = await prisma.$queryRaw`
                SELECT p.id, p.ulpin, p."dagNo", p."pattaNo", p.area, pp."acquisitionStage", pp."riskLevel", ST_AsGeoJSON(ST_Transform(p.geometry, 4326))::json AS geometry
                FROM "ProjectParcel" pp
                JOIN "Parcel" p ON pp."parcelId" = p.id
                WHERE p.geometry IS NOT NULL
                LIMIT 500
            `;
        }

        const features = affected.map((a) => ({
            type: 'Feature',
            geometry: a.geometry,
            properties: { id: a.id, ulpin: a.ulpin, dagNo: a.dagNo, pattaNo: a.pattaNo, area: a.area, acquisitionStage: a.acquisitionStage, riskLevel: a.riskLevel }
        }));

        return sendSuccess(response, { type: 'FeatureCollection', features }, 'Affected parcels retrieved');
    } catch (error) { return next(error); }
}
