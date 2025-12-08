import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      // Debug: Check if token is being attached
      console.log('Attaching token:', token.substring(0, 10) + '...'); 
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in storage!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
