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
        return sendSuccess(response, await projectService.createProject(request.body), 'Project created', 201);
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

export async function remove(request, response, next) {
    try {
        await projectService.deleteProject(request.params.id);
        return response.status(204).send();
    } catch (error) {
        return next(error);
    }
}
