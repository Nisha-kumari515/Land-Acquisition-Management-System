import * as projectService from '../services/project.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(request, response, next) {
    try {
        return sendSuccess(response, await projectService.listProjects(request.query));
    } catch (error) {
        return next(error);
    }
}

export async function getById(request, response, next) {
    try {
        return sendSuccess(response, await projectService.getProject(request.params.id));
    } catch (error) {
        return next(error);
    }
}

export async function create(request, response, next) {
    try {
        return sendSuccess(response, await projectService.createProject({ ...request.body, createdById: request.user.sub }), 'Project created', 201);
    } catch (error) {
        return next(error);
    }
}

export async function update(request, response, next) {
    try {
        return sendSuccess(response, await projectService.updateProject(request.params.id, request.body), 'Project updated');
    } catch (error) {
        return next(error);
    }
}

export async function submit(request, response, next) {
    try { return sendSuccess(response, await projectService.submitProject(request.params.id, request.user.sub), 'Project submitted'); } catch (error) { return next(error); }
}

export async function approve(request, response, next) {
    try { return sendSuccess(response, await projectService.approveProject(request.params.id, request.user.sub), 'Project approved'); } catch (error) { return next(error); }
}

export async function reject(request, response, next) {
    try { return sendSuccess(response, await projectService.rejectProject(request.params.id, request.user.sub), 'Project rejected'); } catch (error) { return next(error); }
}

export async function archive(request, response, next) {
    try { return sendSuccess(response, await projectService.archiveProject(request.params.id, request.user.sub), 'Project archived'); } catch (error) { return next(error); }
}

export async function getProjectIntelligence(request, response, next) {
    try {
        const data = await projectService.getProjectIntelligence(request.params.id);
        return sendSuccess(response, data, 'Project intelligence retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

export async function remove(request, response, next) {
    try {
        await projectService.deleteProject(request.params.id);
        return response.status(204).send();
    } catch (error) {
        return next(error);
    }
}
