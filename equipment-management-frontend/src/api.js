import axios from 'axios';

const base = import.meta.env?.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err?.response?.status === 401 &&
      !window.location.pathname.startsWith('/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

