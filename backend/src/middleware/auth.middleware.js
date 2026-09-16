import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/response.js';
import { prisma } from '../config/database.js';

export async function requireAuth(request, _response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(401, 'UNAUTHORIZED', 'Authorization token is required'));
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
        
        // Ensure user actually still exists in DB (e.g. after a DB wipe)
        const userExists = await prisma.user.findUnique({ 
            where: { id: decoded.sub },
            select: { id: true }
        });

        if (!userExists) {
            return next(new AppError(401, 'INVALID_USER', 'User no longer exists. Please log in again.'));
        }

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
