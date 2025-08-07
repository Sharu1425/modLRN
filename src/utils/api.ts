import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: 'http://localhost:5001',
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
        console.log(`🌐 [API_REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`🌐 [API_REQUEST] Base URL: ${config.baseURL}`);
        console.log(`🌐 [API_REQUEST] Full URL: ${config.baseURL}${config.url}`);
        console.log(`🌐 [API_REQUEST] Headers:`, config.headers);
        console.log(`🌐 [API_REQUEST] Data:`, config.data);
        console.log(`🌐 [API_REQUEST] Token present: ${token ? 'Yes' : 'No'}`);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`🔑 [API_REQUEST] Added Authorization header`);
        } else {
            console.log(`⚠️ [API_REQUEST] No token found in localStorage`);
        }
        
        console.log(`🌐 [API_REQUEST] Final config:`, {
            method: config.method,
            url: config.url,
            baseURL: config.baseURL,
            headers: config.headers,
            timeout: config.timeout,
            withCredentials: config.withCredentials
        });
        
        return config;
    },
    (error) => {
        console.error('❌ [API_REQUEST_ERROR] Request Error:', error);
        console.error('❌ [API_REQUEST_ERROR] Error details:', {
            message: error.message,
            code: error.code,
            config: error.config
        });
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ [API_RESPONSE] ${response.status} ${response.config.url}`);
        console.log(`✅ [API_RESPONSE] Status: ${response.status} ${response.statusText}`);
        console.log(`✅ [API_RESPONSE] Headers:`, response.headers);
        console.log(`✅ [API_RESPONSE] Data:`, response.data);
        console.log(`✅ [API_RESPONSE] Response received successfully`);
        return response;
    },
    (error) => {
        console.error('❌ [API_RESPONSE_ERROR] API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            message: error.message,
            code: error.code
        });
        
        if (error.response?.status === 401) {
            console.log('🔐 [API_RESPONSE_ERROR] 401 Unauthorized - clearing tokens');
            // Clear invalid token
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            // Redirect to login only if not already on login page
            if (window.location.pathname !== '/login') {
                console.log('🔄 [API_RESPONSE_ERROR] Redirecting to login');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
