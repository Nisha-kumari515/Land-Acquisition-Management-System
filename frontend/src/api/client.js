export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error?.message || 'An error occurred');
    }

    return data.data;
}
