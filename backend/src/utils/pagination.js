import { AppError } from './response.js';

export function getPagination(query) {
    const page = Number.parseInt(query.page ?? '1', 10);
    const pageSize = Number.parseInt(query.pageSize ?? '20', 10);

    if (!Number.isInteger(page) || page < 1) throw new AppError(400, 'VALIDATION_ERROR', 'page must be a positive integer');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new AppError(400, 'VALIDATION_ERROR', 'pageSize must be an integer between 1 and 100');
    }

    return {
        page,
        pageSize,
        skip: (page - 1) * pageSize,
        take: pageSize
    };
}

export function paginatedResponse(items, total, page, pageSize) {
    return {
        items,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}
