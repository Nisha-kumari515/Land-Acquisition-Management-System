export function sendSuccess(response, data, message = 'Request successful', status = 200) {
    return response.status(status).json({
        success: true,
        data,
        message
    });
}

export class AppError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
