import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const projectStatuses = new Set(['PROPOSED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
const riskLevels = new Set(['LOW', 'MEDIUM', 'HIGH']);

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
        projectType: input.projectType ?? null,
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
    if (query.status && !projectStatuses.has(query.status)) throw new AppError(400, 'VALIDATION_ERROR', 'status is invalid');
    if (query.riskLevel && !riskLevels.has(query.riskLevel)) throw new AppError(400, 'VALIDATION_ERROR', 'riskLevel is invalid');
    const { page, pageSize, skip, take } = getPagination(query);
    const where = {
        ...(query.stateId ? { stateId: query.stateId } : {}),
        ...(query.state ? { state: { OR: [{ id: query.state }, { code: query.state }, { name: { contains: query.state, mode: 'insensitive' } }] } } : {}),
        ...(query.districtId ? { districtId: query.districtId } : {}),
        ...(query.district ? { district: { OR: [{ id: query.district }, { code: query.district }, { name: { contains: query.district, mode: 'insensitive' } }] } } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.department ? { department: { contains: query.department, mode: 'insensitive' } } : {}),
        ...(query.projectType ? { projectType: { contains: query.projectType, mode: 'insensitive' } } : {}),
        ...(query.riskLevel ? { projectParcels: { some: { riskLevel: query.riskLevel } } } : {}),
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

export async function getProjectIntelligence(id) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            state: { select: { name: true, code: true } },
            district: { select: { name: true, code: true } },
            _count: { select: { projectParcels: true } }
        }
    });

    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

    const [impact, stageDistribution, risks, geometry] = await Promise.all([
        prisma.$queryRaw`SELECT COUNT(id)::int AS count, COALESCE(SUM("affectedArea"), 0)::text AS area FROM "ProjectParcel" WHERE "projectId" = ${id}`,
        prisma.$queryRaw`SELECT "acquisitionStage"::text AS stage, COUNT(*)::int AS count FROM "ProjectParcel" WHERE "projectId" = ${id} GROUP BY "acquisitionStage" ORDER BY count DESC`,
        prisma.$queryRaw`SELECT "riskLevel"::text AS level, COUNT(*)::int AS count FROM "ProjectParcel" WHERE "projectId" = ${id} GROUP BY "riskLevel" ORDER BY count DESC`,
        prisma.$queryRaw`SELECT ST_AsGeoJSON(geometry)::json AS geojson FROM "Project" WHERE id = ${id}`
    ]);

    return {
        project: {
            id: project.id,
            code: project.code,
            name: project.name,
            department: project.department,
            state: project.state,
            district: project.district,
            createdAt: project.createdAt
        },
        impact: {
            affectedParcels: impact[0]?.count || 0,
            affectedArea: impact[0]?.area || 0
        },
        geometry: geometry[0]?.geojson || null,
        acquisition: stageDistribution,
        risk: risks
    };
}

export async function deleteProject(id) {
    await getProject(id);
    return prisma.project.delete({ where: { id } });
}
