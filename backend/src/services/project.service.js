import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const projectInclude = {
    state: { select: { id: true, code: true, name: true } },
    district: { select: { id: true, code: true, name: true } },
    createdBy: { select: { id: true, name: true, email: true } },
    _count: { select: { projectParcels: true } }
};

function projectData(input) {
    return {
        code: input.code,
        name: input.name,
        description: input.description ?? null,
        department: input.department,
        stateId: input.stateId,
        districtId: input.districtId ?? null,
        status: input.status ?? undefined,
        startDate: input.startDate ? new Date(input.startDate) : null,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        createdById: input.createdById
    };
}

async function assertGeography(stateId, districtId) {
    if (!districtId) return;
    const district = await prisma.district.findFirst({ where: { id: districtId, stateId } });
    if (!district) throw new AppError(400, 'INVALID_GEOGRAPHY', 'districtId must belong to stateId');
}

async function assertState(stateId) {
    const state = await prisma.state.findUnique({ where: { id: stateId } });
    if (!state) throw new AppError(400, 'INVALID_STATE', 'stateId does not exist');
}

async function assertCreator(createdById) {
    const user = await prisma.user.findUnique({ where: { id: createdById } });
    if (!user) throw new AppError(400, 'INVALID_CREATOR', 'createdById does not exist');
}

export async function listProjects(query) {
    const { page, pageSize, skip, take } = getPagination(query);
    const where = {
        ...(query.stateId ? { stateId: query.stateId } : {}),
        ...(query.districtId ? { districtId: query.districtId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.search ? {
            OR: [
                { code: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } }
            ]
        } : {})
    };
    const [items, total] = await prisma.$transaction([
        prisma.project.findMany({ where, include: projectInclude, orderBy: { createdAt: 'desc' }, skip, take }),
        prisma.project.count({ where })
    ]);

    return paginatedResponse(items, total, page, pageSize);
}

export async function getProject(id) {
    const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    return project;
}

export async function createProject(input) {
    await assertState(input.stateId);
    await assertGeography(input.stateId, input.districtId);
    await assertCreator(input.createdById);
    return prisma.project.create({ data: projectData(input), include: projectInclude });
}

export async function updateProject(id, input) {
    const existing = await getProject(id);
    const stateId = input.stateId ?? existing.stateId;
    const districtId = input.districtId === undefined ? existing.districtId : input.districtId;
    await assertState(stateId);
    await assertGeography(stateId, districtId);

    return prisma.project.update({
        where: { id },
        data: projectData({ ...existing, ...input, stateId, districtId, createdById: existing.createdById }),
        include: projectInclude
    });
}

export async function deleteProject(id) {
    await getProject(id);
    return prisma.project.delete({ where: { id } });
}
