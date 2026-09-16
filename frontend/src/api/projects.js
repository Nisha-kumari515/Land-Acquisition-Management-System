import { fetchApi } from './client.js';

export const projectApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return fetchApi(`/projects?${qs}`);
    },
    get: (id) => fetchApi(`/projects/${id}`),
    getIntelligence: (id) => fetchApi(`/projects/${id}/intelligence`),
    create: (data) => fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/projects/${id}`, { method: 'DELETE' }),
    submit: (id) => fetchApi(`/projects/${id}/submit`, { method: 'POST' }),
    approve: (id) => fetchApi(`/projects/${id}/approve`, { method: 'POST' }),
    reject: (id) => fetchApi(`/projects/${id}/reject`, { method: 'POST' }),
    archive: (id) => fetchApi(`/projects/${id}/archive`, { method: 'POST' }),
    updateGeometry: (id, geojson) => fetchApi(`/projects/${id}/geometry`, { method: 'PUT', body: JSON.stringify({ geojson }) }),
    analyzeImpact: (id, geometry, srid = 4326) => fetchApi(`/projects/${id}/analyze-impact`, { method: 'POST', body: JSON.stringify({ geometry, srid }) })
};
