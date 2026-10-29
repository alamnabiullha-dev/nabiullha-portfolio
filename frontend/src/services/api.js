
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL || 'http://localhost:5002/api',
  withCredentials: true,
  timeout: 6000,
});

let csrfPromise = null;

async function getCsrfToken() {
  if (!csrfPromise) {
    csrfPromise = api
      .get('/auth/csrf', {
        _skipCsrf: true,
        _skipAuthRefresh: true,
      })
      .then((response) => {
        const token = response.data?.data?.token;

        if (!token) {
          throw new Error('CSRF token missing from server response.');
        }

        return token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();

  if (
    !['get', 'head', 'options'].includes(method) &&
    !config._skipCsrf
  ) {
    const token = await getCsrfToken();

    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !original._skipAuthRefresh &&
      !original.url?.includes('/auth/')
    ) {
      original._retried = true;

      try {
        await api.post('/auth/refresh', null, {
          _skipAuthRefresh: true,
        });

        return api(original);
      } catch {
        // Keep the original request error.
      }
    }

    return Promise.reject(error);
  }
);

export const messageOf = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export default api;
