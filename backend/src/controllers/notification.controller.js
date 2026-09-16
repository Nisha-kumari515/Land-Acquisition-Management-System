import * as notificationService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(request, response, next) {
    try { return sendSuccess(response, await notificationService.listNotifications()); } catch (error) { return next(error); }
}
export async function unread(request, response, next) {
    try { return sendSuccess(response, await notificationService.listNotifications({ unread: 'true' })); } catch (error) { return next(error); }
}
export async function markRead(request, response, next) {
    try { return sendSuccess(response, await notificationService.markRead(request.params.id), 'Notification marked as read'); } catch (error) { return next(error); }
}
export async function markAllRead(_request, response, next) {
    try { return sendSuccess(response, await notificationService.markAllRead(), 'Notifications marked as read'); } catch (error) { return next(error); }
}