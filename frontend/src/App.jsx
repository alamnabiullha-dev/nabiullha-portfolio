import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Portfolio from './pages/Portfolio.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const refresh = async () => { try { const { data } = await api.get('/public/portfolio'); setData(data.data); setError(''); } catch { setError('The portfolio service is unavailable right now.'); } };
  useEffect(() => { api.get('/auth/csrf').catch(()=>{}); refresh(); }, []);
  return <Routes><Route path="/" element={<Portfolio data={data} loading={!data && !error} error={error} />} /><Route path="/projects/:slug" element={<ProjectPage data={data} loading={!data && !error} />} /><Route path="/admin/*" element={<Admin onSaved={refresh} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
