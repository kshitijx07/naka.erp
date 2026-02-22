import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    console.log('Environment VITE_API_URL:', envUrl);

    let finalUrl = envUrl;

    // Fallback if missing or internal hostname
    if (!envUrl || envUrl.includes('backend') || envUrl.includes('localhost')) {
        finalUrl = `http://${window.location.hostname}:5000`;
    }

    // Ensure it ends with /api
    if (!finalUrl.endsWith('/api')) {
        finalUrl = finalUrl.endsWith('/') ? `${finalUrl}api` : `${finalUrl}/api`;
    }

    console.log('Final resolved API URL:', finalUrl);
    return finalUrl;
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
