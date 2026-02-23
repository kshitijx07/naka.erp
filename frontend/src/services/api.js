import axios from 'axios';

const getBaseURL = () => {
    // In development (using .env.development), VITE_API_URL is set to '/api'
    // to leverage the Vite proxy (configured in vite.config.js).
    // In production, it should be the full URL (e.g., http://51.21.1.228:5000/api).
    const envUrl = import.meta.env.VITE_API_URL;

    if (envUrl) {
        console.log('Using API URL from environment:', envUrl);
        return envUrl;
    }

    // Fallback logic if VITE_API_URL is missing
    const fallbackUrl = `http://${window.location.hostname}:5000/api`;
    console.log('Fallback API URL:', fallbackUrl);
    return fallbackUrl;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor (optional: handle 401s for refresh token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle logout or refresh (for now just logout)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
