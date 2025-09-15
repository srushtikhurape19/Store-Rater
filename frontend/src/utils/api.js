import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, (error) => {
    console.error('API Request Error:', error.config.method.toUpperCase(), error.config.url);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    } else if (error.request) {
        console.error('No response received:', error.request);
    } else {
        console.error('Error message:', error.message);
    }
    return Promise.reject(error);
});

export default api;
