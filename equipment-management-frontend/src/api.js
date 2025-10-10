import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = window.location.origin;
axios.defaults.timeout = 10000;

// Add request interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axios;
