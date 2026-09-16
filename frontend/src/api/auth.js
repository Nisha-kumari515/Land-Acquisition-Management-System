import { fetchApi } from './client.js';

export const authApi = {
    login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => fetchApi('/auth/me'),
};
