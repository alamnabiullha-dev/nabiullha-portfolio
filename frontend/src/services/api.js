import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api', withCredentials: true, timeout: 120000 });
let csrfToken = '';
let csrfPromise;
api.interceptors.request.use(async (config) => {
  if (!['get', 'head', 'options'].includes((config.method || 'get').toLowerCase()) && !config._skipCsrf) {
    if (!csrfToken) { csrfPromise ||= api.get('/auth/csrf', { _skipCsrf: true }).then((r) => { csrfToken = r.data.data.token; return csrfToken; }).finally(() => { csrfPromise = null; }); await csrfPromise; }
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
api.interceptors.response.use((r) => { if (r.config.url?.includes('/auth/csrf')) csrfToken = r.data?.data?.token || ''; return r; });
api.interceptors.response.use((r) => r, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original?._retried && !original?.url?.includes('/auth/')) {
    original._retried = true;
    try { await api.post('/auth/refresh'); return api(original); } catch { /* show original error */ }
  }
  return Promise.reject(error);
});
export const messageOf = (error) => error?.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
