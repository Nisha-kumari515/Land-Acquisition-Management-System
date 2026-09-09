import { AppError } from '../utils/response.js';

export function validateBody(requiredFields = []) {
    return (request, _response, next) => {
        const missingFields = requiredFields.filter((field) => {
            const value = request.body?.[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            return next(new AppError(400, 'VALIDATION_ERROR', `Missing required fields: ${missingFields.join(', ')}`));
        }

        next();
    };
}

export function validatePositiveNumber(field) {
    return (request, _response, next) => {
        const value = Number(request.body?.[field]);
        if (!Number.isFinite(value) || value <= 0) {
            return next(new AppError(400, 'VALIDATION_ERROR', `${field} must be a positive number`));
        }

        next();
    };
}
