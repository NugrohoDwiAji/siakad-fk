import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL

// Fungsi helper untuk mengambil value dari cookie browser
const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
};

const api = axios.create({
    baseURL: API_BASE_URL, 
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request Interceptor
api.interceptors.request.use((config) => {
    // 1. Ambil token CSRF dari cookie browser
    const token = getCookie('XSRF-TOKEN');

       if (token) {
        config.headers['X-XSRF-TOKEN'] = token;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor - Handle 401 Unauthorized
const AUTH_PATHS = [
    '/api/auth/staff/me', '/api/auth/staff/login', '/api/auth/staff/logout',
    '/api/mhs/me', '/api/mhs/login', '/api/mhs/logout',
    '/api/dosen/me', '/api/auth/dosen/login', '/api/dosen/logout',
    '/sanctum/csrf-cookie',
    '/api/dosen/penilaian',
];

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            const isAuthPath = AUTH_PATHS.some((p) => url.includes(p));

            if (!isAuthPath) {
                // Determine which auth store to clear
                if (window.location.pathname.startsWith('/dosen')) {
                    localStorage.removeItem('dosen-auth');
                    window.location.href = '/dosen/auth';
                } else if (window.location.pathname.startsWith('/admin')) {
                    localStorage.removeItem('staf-auth');
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;