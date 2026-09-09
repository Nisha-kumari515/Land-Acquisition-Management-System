export function errorHandler(error, _request, response, _next) {
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

  const status = error.status ?? 500;
  const code = error.code ?? 'INTERNAL_SERVER_ERROR';
  const message = status >= 500 ? 'Internal server error' : error.message;

  if (status >= 500) console.error(error);

  return response.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
