import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach JWT if available
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            try {
                const { token } = JSON.parse(stored);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // ignore parse errors
            }
        }
    }
    return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — redirect to login
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                localStorage.removeItem('auth_user');
                window.location.href = '/login';
            }
        } else if (error.response?.status === 429) {
            console.error('Rate limit exceeded');
        } else if (error.response?.status === 400) {
            console.error('Validation error', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
