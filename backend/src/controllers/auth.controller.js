import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export async function login(request, response, next) {
    try {
        const { email, password } = request.body ?? {};
        return sendSuccess(response, await authService.login(email, password), 'Login successful', 200);
    } catch (error) {
        return next(error);
    }
}

export async function me(request, response, next) {
    try {
        return sendSuccess(response, await authService.me(request.user.sub), 'User profile retrieved');
    } catch (error) {
        return next(error);
    }
}
