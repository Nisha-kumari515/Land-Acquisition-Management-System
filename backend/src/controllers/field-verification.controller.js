import * as service from '../services/field-verification.service.js';
import { sendSuccess } from '../utils/response.js';
export async function list(request, response, next) { try { return sendSuccess(response, await service.list(request.query)); } catch (error) { return next(error); } }
export async function get(request, response, next) { try { return sendSuccess(response, await service.get(request.params.id)); } catch (error) { return next(error); } }
export async function create(request, response, next) { try { return sendSuccess(response, await service.create(request.body, request.user.sub), 'Field verification created', 201); } catch (error) { return next(error); } }
export async function update(request, response, next) { try { return sendSuccess(response, await service.update(request.params.id, request.body, request.user.sub), 'Field verification updated'); } catch (error) { return next(error); } }