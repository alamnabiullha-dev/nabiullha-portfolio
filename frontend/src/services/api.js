
import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5002/api',
  withCredentials: true,
  timeout: 120000,
});

let csrfToken = '';
let csrfPromise = null;

// Fetch a CSRF token from the backend
const getCsrfToken = async (forceRefresh = false) => {
  if (forceRefresh) {
    csrfToken = '';
  }

  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = api
      .get('/auth/csrf', {
        _skipCsrf: true,
      })
      .then((response) => {
        const token = response.data?.data?.token;

        if (!token) {
          throw new Error('CSRF token was not returned by the server.');
        }

        csrfToken = token;
        return token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

// Add the CSRF token to requests that modify data
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

// Handle responses and retry a CSRF failure once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original) {
      return Promise.reject(error);
    }

    const isCsrfFailure =
      error.response?.status === 403 &&
      error.response?.data?.message ===
      'Request validation failed. Refresh and try again.';

    if (isCsrfFailure && !original._csrfRetried) {
      original._csrfRetried = true;

      try {
        const token = await getCsrfToken(true);

        original.headers = original.headers || {};
        original.headers['X-CSRF-Token'] = token;

        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    // Refresh an expired session for protected API requests.
    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes('/auth/')
    ) {
      original._retried = true;

      try {
        await api.post('/auth/refresh');
        return api(original);
      } catch {
        // Preserve the original request error.
      }
    }

    return Promise.reject(error);
  }
);

// Get a readable error message in the frontend
export const messageOf = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export default api;
