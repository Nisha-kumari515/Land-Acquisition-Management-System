import { prisma } from '../config/database.js';
import { sendSuccess, AppError } from '../utils/response.js';

const startupTime = Date.now();

export async function getOverallHealth(req, res, next) {
    try {
        const dbStatus = await checkDb() ? 'UP' : 'DOWN';
        const postgisStatus = await checkPostgis() ? 'UP' : 'DOWN';
        const integrationStatus = await checkIntegrations() ? 'UP' : 'DOWN';

        res.json({
            success: true,
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: formatUptime(Date.now() - startupTime),
            services: {
                api: 'UP',
                database: dbStatus,
                postgis: postgisStatus,
                assamIntegration: integrationStatus
            }
        });
    } catch (error) { next(error); }
}

export async function getDatabaseHealth(req, res, next) {
    try {
        const isUp = await checkDb();
        if (!isUp) throw new AppError(503, 'DB_DOWN', 'Database is down');
        sendSuccess(res, { status: 'UP' }, 'Database is healthy');
    } catch (error) { next(error); }
}

export async function getPostgisHealth(req, res, next) {
    try {
        const isUp = await checkPostgis();
        if (!isUp) throw new AppError(503, 'POSTGIS_DOWN', 'PostGIS is not available');
        sendSuccess(res, { status: 'UP' }, 'PostGIS is healthy');
    } catch (error) { next(error); }
}

export async function getIntegrationsHealth(req, res, next) {
    try {
        const isUp = await checkIntegrations();
        if (!isUp) throw new AppError(503, 'INTEGRATION_DOWN', 'Integration is down');
        sendSuccess(res, { status: 'UP' }, 'Integrations are healthy');
    } catch (error) { next(error); }
}

async function checkDb() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch { return false; }
}

async function checkPostgis() {
    try {
        const result = await prisma.$queryRaw`SELECT PostGIS_Version()`;
        return !!result;
    } catch { return false; }
}

async function checkIntegrations() {
    // just dummy check for now
    return true;
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}
