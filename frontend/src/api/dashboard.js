import { fetchApi } from './client.js';

export const dashboardApi = {
    getOverview: () => fetchApi('/dashboard/overview'),
    getNational: () => fetchApi('/dashboard/national'),
    getState: (stateId) => fetchApi(`/dashboard/state/${stateId}`),
    getDistrict: (districtId) => fetchApi(`/dashboard/district/${districtId}`),
    getProject: (projectId) => fetchApi(`/dashboard/project/${projectId}`)
};
