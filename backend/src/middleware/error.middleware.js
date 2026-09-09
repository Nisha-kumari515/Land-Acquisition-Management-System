export function errorHandler(error, _request, response, _next) {
  console.error(error);

  response.status(503).json({
    success: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Service health check failed'
    }
  });
}
