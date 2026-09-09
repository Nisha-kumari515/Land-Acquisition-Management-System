export function getApiDocs() {
    return {
        title: 'BHOOMISETU API',
        version: '1.0.0',
        description: 'Smart India Hackathon 2026 land acquisition management system API',
        endpoints: [
            { method: 'GET', path: '/api/health', summary: 'Database and PostGIS health' },
            { method: 'POST', path: '/api/auth/login', summary: 'Seeding demo user login' },
            { method: 'GET', path: '/api/auth/me', summary: 'Authenticated user profile' },
            { method: 'GET', path: '/api/projects', summary: 'Project list' },
            { method: 'GET', path: '/api/parcels', summary: 'Parcel list' },
            { method: 'GET', path: '/api/parcels/:parcelId/geometry', summary: 'Parcel geometry for map display' },
            { method: 'GET', path: '/api/projects/:projectId/affected-parcels', summary: 'Affected parcels with GIS filters' },
            { method: 'GET', path: '/api/projects/:projectId/geojson', summary: 'Project parcel GeoJSON FeatureCollection' },
            { method: 'POST', path: '/api/projects/:projectId/impact-analysis', summary: 'GIS impact analysis' },
            { method: 'GET', path: '/api/rr/families', summary: 'R&R family list' },
            { method: 'GET', path: '/api/risks', summary: 'Risk alert list' },
            { method: 'GET', path: '/api/dashboard/overview', summary: 'Executive summary' },
            { method: 'GET', path: '/api/integrations', summary: 'Integration catalog' },
            { method: 'GET', path: '/api/integrations/assam/status', summary: 'Assam source freshness and connection status' },
            { method: 'GET', path: '/api/integrations/sync-logs', summary: 'Sanitized synchronization history' },
            { method: 'GET', path: '/api/integrations/sync-logs/:id', summary: 'Synchronization log detail' },
            { method: 'POST', path: '/api/integrations/assam/sync', summary: 'Synchronize an Assam BhuNaksha parcel' },
            { method: 'GET', path: '/api/audit', summary: 'Audit log list' }
        ]
    };
}
