export function getPagination(query) {
    const page = Math.max(Number.parseInt(query.page ?? '1', 10), 1);
    const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize ?? '20', 10), 1), 100);

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
