export function errorHandler(error, request, response, next) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (error.code === 'P2002') {
        return response.status(409).json({
            success: false,
            error: { code: 'DUPLICATE_RESOURCE', message: 'A resource with the same unique value already exists' }
        });
    }

    if (error.code === 'P2025') {
        return response.status(404).json({
            success: false,
            error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found' }
        });
    }

    const status = error.status || 500;
    const code = error.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
    const message = status === 500 && isProduction ? 'Internal server error' : error.message;

    if (status >= 500) {
        console.error(`[${new Date().toISOString()}] ERROR: ${request.method} ${request.url} -`, error);
    }

    return response.status(status).json({
        success: false,
        error: {
            code,
            message,
            ...(error.dataStatus ? { dataStatus: error.dataStatus } : {}),
            ...(error.syncStatus ? { syncStatus: error.syncStatus } : {})
        }
    });
}
