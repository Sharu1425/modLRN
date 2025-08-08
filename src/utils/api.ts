import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Environment-based API configuration
const getApiBaseUrl = () => {
    // Check for environment variable or use production URL
    const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl;
    }
    
    // Production URL
    return 'https://modlrn.onrender.com';
};

// Create axios instance with default configuration
const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout - increased from 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        console.error('🌐 [API] Request error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.log('🔐 [API] Unauthorized request, clearing token');
            // Clear invalid token
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            // Redirect to login only if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else {
            console.error('🌐 [API] Response error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
