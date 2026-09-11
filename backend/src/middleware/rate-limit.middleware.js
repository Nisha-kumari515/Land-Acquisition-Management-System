import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later.' } }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, please try again later.' } }
});

export const searchLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many search requests, please try again later.' } }
});

export const gisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many GIS requests, please try again later.' } }
});

export const integrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many integration syncs, please try again later.' } }
});
