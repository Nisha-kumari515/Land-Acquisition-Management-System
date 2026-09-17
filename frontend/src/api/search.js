import { fetchApi } from './client.js';

export const searchApi = {
    globalSearch: (query) => fetchApi(`/search?q=${encodeURIComponent(query)}`)
};
