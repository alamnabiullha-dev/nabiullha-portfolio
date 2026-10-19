
import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import api from './services/api';
import Portfolio from './pages/Portfolio.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/public/portfolio');
      const portfolioData = response.data?.data;

      if (!portfolioData) {
        throw new Error('Invalid portfolio API response.');
      }

      setData(portfolioData);
    } catch (err) {
      console.error('Failed to load portfolio:', err);

      setError(
        err.code === 'ECONNABORTED'
          ? 'The server is taking too long to respond. Please try again.'
          : 'The portfolio service is unavailable right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Portfolio
            data={data}
            loading={loading}
            error={error}
          />
        }
      />

      <Route
        path="/projects/:slug"
        element={
          <ProjectPage
            data={data}
            loading={loading}
          />
        }
      />

      <Route
        path="/admin/*"
        element={<Admin onSaved={refresh} />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
