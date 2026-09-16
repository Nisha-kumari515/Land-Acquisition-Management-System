import { prisma } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';

export async function globalSearch(request, response, next) {
    try {
        const q = request.query.q;
        if (!q || q.length < 2) {
            return sendSuccess(response, { results: [] }, 'Search query must be at least 2 characters');
        }

        const user = request.user;
        const stateFilter = user.role !== 'NATIONAL_ADMIN' && user.stateId ? { stateId: user.stateId } : {};
        const districtFilter = (user.role === 'DISTRICT_OFFICER' || user.role === 'ACQUISITION_OFFICER') && user.districtId ? { districtId: user.districtId } : {};

        const projectFilter = { ...stateFilter, ...districtFilter, OR: [{ code: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }, { id: { equals: q } }] };
        const parcelFilter = { ...stateFilter, ...districtFilter, OR: [
            { id: { equals: q } }, 
            { dagNo: { contains: q, mode: 'insensitive' } }, 
            { ulpin: { contains: q, mode: 'insensitive' } }, 
            { pattaNo: { contains: q, mode: 'insensitive' } },
            { village: { contains: q, mode: 'insensitive' } }
        ] };
        
        const districtNameFilter = { name: { contains: q, mode: 'insensitive' } };

        const [projects, parcels, districts, villages] = await Promise.all([
            prisma.project.findMany({ where: projectFilter, take: 10, select: { id: true, code: true, name: true } }),
            prisma.parcel.findMany({ where: parcelFilter, take: 20, select: { id: true, ulpin: true, village: true, dagNo: true, pattaNo: true } }),
            prisma.district.findMany({ where: districtNameFilter, take: 5, select: { id: true, name: true, state: { select: { name: true } } } }),
            prisma.parcel.groupBy({ by: ['village'], where: { village: { contains: q, mode: 'insensitive' } }, take: 10 })
        ]);

        const typedResults = [
            ...projects.map(p => ({ type: 'PROJECT', id: p.id, title: p.name, subtitle: p.code })),
            ...parcels.map(p => ({ type: 'PARCEL', id: p.id, title: `DAG: ${p.dagNo || 'N/A'}, ULPIN: ${p.ulpin || 'N/A'}`, subtitle: p.village })),
            ...districts.map(d => ({ type: 'DISTRICT', id: d.id, title: d.name, subtitle: d.state?.name })),
            ...villages.map(v => ({ type: 'VILLAGE', id: v.village, title: v.village, subtitle: 'Village' }))
        ];

        return sendSuccess(response, { results: typedResults }, 'Search results retrieved');
    } catch (error) {
        if (error.code === 'P2023') { // Inconsistent column data (UUID parse error)
            // Re-run search without ID lookups if UUID format fails
            try {
                const q = request.query.q;
                const projectFilter = { OR: [{ code: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] };
                const parcelFilter = { OR: [{ dagNo: { contains: q, mode: 'insensitive' } }, { ulpin: { contains: q, mode: 'insensitive' } }, { pattaNo: { contains: q, mode: 'insensitive' } }, { village: { contains: q, mode: 'insensitive' } }] };
                
                const [projects, parcels] = await Promise.all([
                    prisma.project.findMany({ where: projectFilter, take: 10, select: { id: true, code: true, name: true } }),
                    prisma.parcel.findMany({ where: parcelFilter, take: 20, select: { id: true, ulpin: true, village: true, dagNo: true, pattaNo: true } })
                ]);
                const typedResults = [
                    ...projects.map(p => ({ type: 'PROJECT', id: p.id, title: p.name, subtitle: p.code })),
                    ...parcels.map(p => ({ type: 'PARCEL', id: p.id, title: `DAG: ${p.dagNo || 'N/A'}, ULPIN: ${p.ulpin || 'N/A'}`, subtitle: p.village }))
                ];
                return sendSuccess(response, { results: typedResults }, 'Search results retrieved');
            } catch (fallbackError) { return next(fallbackError); }
        }
        return next(error);
    }
}
