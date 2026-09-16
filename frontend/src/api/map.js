import { fetchApi } from './client.js';

export const mapApi = {
    getParcels: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.bbox) qs.append('bbox', params.bbox);
        if (params.village) qs.append('village', params.village);
        return fetchApi(`/map/parcels${qs.toString() ? '?' + qs.toString() : ''}`);
    },
    getProjects: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.bbox) qs.append('bbox', params.bbox);
        return fetchApi(`/map/projects${qs.toString() ? '?' + qs.toString() : ''}`);
    },
    getAffectedParcels: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.bbox) qs.append('bbox', params.bbox);
        return fetchApi(`/map/affected-parcels${qs.toString() ? '?' + qs.toString() : ''}`);
    }
};
