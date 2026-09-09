import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';

export function requireAuth(request, _response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Authorization token is required'));
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        request.user = decoded;
        return next();
    } catch (_error) {
        return next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
    }
}

export function requireRole(...allowedRoles) {
    return (request, _response, next) => {
        const role = request.user?.role;
        if (!role || !allowedRoles.includes(role)) {
            return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to access this resource'));
        }
        next();
    };
}
