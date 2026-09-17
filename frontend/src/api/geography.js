import { fetchApi } from './client.js';

export const geographyApi = {
    getDistricts: () => fetchApi('/integrations/assam/districts'),
    getCircles: (district) => fetchApi('/integrations/assam/circles', { method: 'POST', body: JSON.stringify({ district }) }),
    getVillages: (district, circle) => fetchApi('/integrations/assam/villages', { method: 'POST', body: JSON.stringify({ district, tehsil: circle }) })
};
