import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function getStates(req, res, next) {
    try {
        const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
        return sendSuccess(res, states, 'States retrieved');
    } catch (error) { return next(error); }
}

export async function getDistricts(req, res, next) {
    try {
        const { stateId } = req.query;
        const where = stateId ? { stateId } : {};
        const districts = await prisma.district.findMany({ where, orderBy: { name: 'asc' } });
        return sendSuccess(res, districts, 'Districts retrieved');
    } catch (error) { return next(error); }
}

export async function getCircles(req, res, next) {
    try {
        const { districtId, stateId } = req.query;
        const where = {};
        if (districtId) where.districtId = districtId;
        if (stateId) where.stateId = stateId;
        
        const results = await prisma.parcel.groupBy({
            by: ['circle'],
            where: { ...where, circle: { not: null, not: '' } },
            orderBy: { circle: 'asc' }
        });
        const circles = results.map(r => r.circle);
        return sendSuccess(res, circles, 'Circles retrieved');
    } catch (error) { return next(error); }
}

export async function getVillages(req, res, next) {
    try {
        const { circle, districtId, stateId } = req.query;
        let query = `SELECT DISTINCT village FROM "Parcel" WHERE village IS NOT NULL AND village != ''`;
        const conditions = [];
        
        // Escape input to prevent SQL injection or use Prisma raw parameters
        // Better yet, use Prisma's groupBy since it's safer
        
        const where = {};
        if (circle) where.circle = circle;
        if (districtId) where.districtId = districtId;
        if (stateId) where.stateId = stateId;

        const results = await prisma.parcel.groupBy({
            by: ['village'],
            where,
            orderBy: { village: 'asc' }
        });

        const villages = results.map(r => r.village);
        return sendSuccess(res, villages, 'Villages retrieved');
    } catch (error) { return next(error); }
}
