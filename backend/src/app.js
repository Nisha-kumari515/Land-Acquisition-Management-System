import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(helmet());
app.use(cors({
    origin: (requestOrigin, callback) => {
        if (!requestOrigin || env.corsOrigin.includes(requestOrigin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 100 }));
app.use((request, _response, next) => {
    const startTime = Date.now();
    const originalJson = _response.json.bind(_response);

    _response.json = (body) => {
        const elapsedMs = Date.now() - startTime;
        if (request.path.startsWith('/api') && request.path !== '/api/health' && request.method !== 'OPTIONS') {
            prisma.auditLog.create({
                data: {
                    userId: request.user?.sub ?? null,
                    action: `${request.method} ${request.path}`,
                    entity: 'API_REQUEST',
                    entityId: `${request.method}:${request.path}`,
                    previousValue: { statusCode: _response.statusCode, elapsedMs },
                    newValue: {
                        query: request.query,
                        body: request.method === 'GET' ? null : request.body
                    }
                }
            }).catch((error) => console.error('Audit logging failed:', error));
        }

        return originalJson(body);
    };

    next();
});

app.use('/api', apiRoutes);
app.use(errorHandler);
