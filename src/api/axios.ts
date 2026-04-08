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

export default api;