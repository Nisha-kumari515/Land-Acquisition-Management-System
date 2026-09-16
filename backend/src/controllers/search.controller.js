import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function globalSearch(request, response, next) {
    try {
        const q = request.query.q;
        if (!q || q.length < 3) {
            return sendSuccess(response, { projects: [], parcels: [], owners: [], locations: [] }, 'Search query must be at least 3 characters');
        }

        const user = request.user;
        const stateFilter = user.role !== 'NATIONAL_ADMIN' && user.stateId ? { stateId: user.stateId } : {};
        const districtFilter = (user.role === 'DISTRICT_OFFICER' || user.role === 'ACQUISITION_OFFICER') && user.districtId ? { districtId: user.districtId } : {};

        const projectFilter = { ...stateFilter, ...districtFilter, OR: [{ code: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] };
        const parcelFilter = { ...stateFilter, ...districtFilter, OR: [{ ulpin: { contains: q, mode: 'insensitive' } }, { village: { contains: q, mode: 'insensitive' } }] };

        const [projects, parcels, owners] = await Promise.all([
            prisma.project.findMany({ where: projectFilter, take: 10, select: { id: true, code: true, name: true, department: true } }),
            prisma.parcel.findMany({ where: parcelFilter, take: 10, select: { id: true, ulpin: true, village: true } }),
            prisma.parcelOwner.findMany({ where: { name: { contains: q, mode: 'insensitive' } }, take: 10, select: { id: true, name: true, parcelId: true } })
        ]);

        return sendSuccess(response, { projects, parcels, owners, locations: [] }, 'Search results retrieved');
    } catch (error) {
        return next(error);
    }
}
