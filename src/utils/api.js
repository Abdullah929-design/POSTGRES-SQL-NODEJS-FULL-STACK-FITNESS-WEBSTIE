import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

// Automatically attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If any response comes back as 401/403, the token is invalid/expired.
// Clear it and send the user back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response && error.response.status;
    if (status === 401 || status === 403) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        // Full reload so AuthContext + Navbar re-render in the logged-out state.
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
