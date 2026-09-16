import { fetchApi } from './client.js';

export const parcelApi = {
    list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return fetchApi(`/parcels?${qs}`);
    },
    get: (id) => fetchApi(`/parcels/${id}`),
    getIntelligence: (id) => fetchApi(`/parcels/${id}/intelligence`)
};
