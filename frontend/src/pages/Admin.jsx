import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Briefcase, Check, ChevronRight, Code2, FileText, FolderKanban, Image, LayoutDashboard, LogOut, Mail, Plus, Save, Settings, ShieldCheck, Trash2, Trophy, UserRound, Upload, Wrench, X } from 'lucide-react';
import api, { messageOf } from '../services/api.js';

const sections = [['dashboard', 'Dashboard', LayoutDashboard], ['profile', 'Profile', UserRound], ['education', 'Education', BookOpen], ['skills', 'Skills', Wrench], ['projects', 'Projects', FolderKanban], ['leetcode', 'LeetCode', Code2], ['achievements', 'Achievements', Trophy], ['experiences', 'Experience & activities', Briefcase], ['messages', 'Messages', Mail], ['resume', 'Media & resume', Image], ['settings', 'Settings', Settings]];

const configs = {
    education: { title: 'Education', fields: [['level', 'Level (college, class 12, class 10)'], ['institution', 'Institution / school'], ['degree', 'Degree / qualification'], ['field', 'Specialization'], ['board', 'Board'], ['location', 'Location'], ['period', 'Study period'], ['semester', 'Semester'], ['startYear', 'Start year'], ['endYear', 'End / passing year'], ['score', 'CGPA / marks'], ['percentage', 'Percentage'], ['description', 'Description', 'long'], ['photo', 'School / college photo', 'media'], ['order', 'Display order', 'number'], ['isPublic', 'Public', 'bool']] },
    skills: { title: 'Skills', fields: [['name', 'Skill'], ['category', 'Category'], ['order', 'Display order', 'number'], ['isPublic', 'Public', 'bool']] },
    projects: {
        title: 'Projects',
        fields: [
            ['name', 'Name'], ['slug', 'Slug'], ['category', 'Category'],
            ['shortDescription', 'Short description', 'long'],
            ['description', 'Detailed description', 'long'],
            ['problem', 'Problem statement', 'long'],
            ['solution', 'Solution', 'long'],
            ['features', 'Features (one per line)', 'list'],
            ['technologies', 'Technologies (comma separated)', 'csv'],
            ['contribution', 'My contribution', 'long'],
            ['githubUrl', 'GitHub URL'], ['liveUrl', 'Live demo / external profile URL (e.g. LeetCode)'],
            ['videoUrl', 'YouTube / external video URL'],
            ['documentationUrl', 'Documentation URL'], ['status', 'Status'],
            ['startDate', 'Start date'], ['completionDate', 'Completion date'],
            ['order', 'Display order', 'number'], ['featured', 'Featured', 'bool'],
            ['published', 'Published', 'bool'], ['cover', 'Cover image / logo', 'media'],
            ['video', 'Video file', 'media'], ['gallery', 'Screenshots', 'gallery']
        ]
    },
    achievements: { title: 'Achievements', fields: [['title', 'Title'], ['eventName', 'Competition / event'], ['organization', 'Organization'], ['award', 'Award / participation'], ['date', 'Date'], ['location', 'Location'], ['description', 'Description', 'long'], ['verificationUrl', 'Verification URL'], ['kind', 'Type'], ['featured', 'Featured', 'bool'], ['isPublic', 'Public', 'bool'], ['certificate', 'Certificate image / PDF', 'media'], ['eventPhoto', 'Event photo', 'media']] },
    experiences: { title: 'Experience & activities', fields: [['kind', 'Type (internship, activity, etc.)'], ['organization', 'Organization'], ['role', 'Role'], ['title', 'Title'], ['startDate', 'Start date'], ['endDate', 'End date'], ['responsibilities', 'Responsibilities (one per line)', 'list'], ['skills', 'Skills learned (comma separated)', 'csv'], ['description', 'Description', 'long'], ['isPublic', 'Public', 'bool'], ['attachment', 'Attachment', 'media']] },
    messages: { title: 'Contact messages', fields: [['name', 'Name', 'readonly'], ['email', 'Email', 'readonly'], ['organization', 'Organization', 'readonly'], ['subject', 'Subject', 'readonly'], ['message', 'Message', 'longread'], ['read', 'Read', 'bool'], ['archived', 'Archived', 'bool']] }
};

// NEW: Read a video's duration in the browser before uploading it.
function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const objectUrl = URL.createObjectURL(file);

        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            const duration = video.duration;
            URL.revokeObjectURL(objectUrl);
            resolve(duration);
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Could not read the video duration. Please choose another video.'));
        };

        video.src = objectUrl;
    });
}

export default function Admin({ onSaved }) {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const nav = useNavigate();

    useEffect(() => {
        api.get('/auth/me')
            .then(r => setUser(r.data.data))
            .catch(() => setUser(null))
            .finally(() => setChecked(true));
    }, []);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        setUser(null);
        nav('/admin/login');
    };

    if (!checked) return <main className="container section">Checking admin session…</main>;

    return (
        <Routes>
            <Route path="login" element={user ? <NavigateAdmin /> : <Login onLogin={setUser} />} />
            <Route path="*" element={user ? <AdminLayout user={user} logout={logout} onSaved={onSaved} /> : <NavigateAdmin to="/admin/login" />} />
        </Routes>
    );
}

function NavigateAdmin({ to = '/admin/dashboard' }) {
    const nav = useNavigate();
    useEffect(() => nav(to, { replace: true }), [nav, to]);
    return null;
}

function Login({ onLogin }) {
    const [initialized, setInitialized] = useState(null);
    const [setup, setSetup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();

    useEffect(() => {
        api.get('/auth/status')
            .then(r => setInitialized(r.data.data.initialized))
            .catch(() => setInitialized(false));
    }, []);

    const submit = async e => {
        e.preventDefault();
        setBusy(true);
        setErr('');

        try {
            const r = setup
                ? await api.post('/auth/setup', { email, password }, { headers: { 'X-Admin-Init-Token': token } })
                : await api.post('/auth/login', { email, password });

            onLogin(r.data.data);
            nav('/admin/dashboard');
        } catch (e) {
            setErr(messageOf(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
            <form onSubmit={submit} className="panel" style={{ width: 'min(440px,100%)', padding: 30, display: 'grid', gap: 15 }}>
                <Link to="/" className="eyebrow">← Back to portfolio</Link>
                <ShieldCheck color="#b5f36b" />
                <h1 style={{ margin: '0 0 3px' }}>{setup ? 'Create the first admin' : 'Admin sign in'}</h1>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                    {initialized === false ? 'No administrator exists. Use the one-time ADMIN_INIT_TOKEN from the server environment to initialize access.' : 'Sign in to manage portfolio content.'}
                </p>
                {initialized === false && <div className="notice" style={{ fontSize: 12 }}>Initial setup is available only until the first admin account is created. Set the token on the server before using setup.</div>}
                <label className="muted" style={{ fontSize: 13 }}>Email
                    <input required type="email" className="input" style={{ marginTop: 7 }} value={email} onChange={e => setEmail(e.target.value)} />
                </label>
                <label className="muted" style={{ fontSize: 13 }}>Password
                    <input required type="password" minLength={setup ? 12 : 1} className="input" style={{ marginTop: 7 }} value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                {setup && <label className="muted" style={{ fontSize: 13 }}>One-time setup token
                    <input required className="input" style={{ marginTop: 7 }} value={token} onChange={e => setToken(e.target.value)} />
                </label>}
                {err && <p className="error" style={{ fontSize: 13 }}>{err}</p>}
                <button className="btn btn-primary" disabled={busy || initialized === null} type="submit">
                    {busy ? 'Please wait…' : setup ? 'Create admin account' : 'Sign in'}
                </button>
                {initialized === false && <button type="button" className="btn" onClick={() => setSetup(!setup)}>{setup ? 'Return to sign in' : 'Initialize first admin'}</button>}
            </form>
        </main>
    );
}

function AdminLayout({ user, logout, onSaved }) {
    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <Link to="/" className="mono" style={{ display: 'block', marginBottom: 24 }}>NA<span style={{ color: '#b5f36b' }}>.</span> <small style={{ color: '#98a49b' }}>ADMIN</small></Link>
                <nav className="admin-nav">
                    {sections.map(([path, label, Icon]) => <NavLink key={path} to={`/admin/${path}`}><Icon size={16} style={{ marginRight: 9 }} />{label}</NavLink>)}
                </nav>
                <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
                    <p className="muted" style={{ fontSize: 12, overflowWrap: 'anywhere' }}>{user.email}</p>
                    <button className="btn" onClick={logout}><LogOut size={15} /> Sign out</button>
                </div>
            </aside>
            <main className="admin-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div><div className="eyebrow">Portfolio control panel</div><h1 style={{ fontSize: 30, margin: '8px 0 0' }}>Manage your site</h1></div>
                    <Link className="btn" to="/" target="_blank">View public site <ChevronRight size={15} /></Link>
                </div>
                <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfileEditor onSaved={onSaved} />} />
                    <Route path="education" element={<Crud resource="education" onSaved={onSaved} />} />
                    <Route path="skills" element={<Crud resource="skills" onSaved={onSaved} />} />
                    <Route path="projects" element={<Crud resource="projects" onSaved={onSaved} />} />
                    <Route path="leetcode" element={<LeetCodeManager onSaved={onSaved} />} />
                    <Route path="achievements" element={<Crud resource="achievements" onSaved={onSaved} />} />
                    <Route path="experiences" element={<Crud resource="experiences" onSaved={onSaved} />} />
                    <Route path="messages" element={<Crud resource="messages" onSaved={onSaved} />} />
                    <Route path="resume" element={<Resume onSaved={onSaved} />} />
                    <Route path="settings" element={<SettingsEditor onSaved={onSaved} />} />
                    <Route path="*" element={<NavigateAdmin />} />
                </Routes>
            </main>
        </div>
    );
}

function Dashboard() {
    const [d, setD] = useState(null);
    const [err, setErr] = useState('');

    useEffect(() => {
        api.get('/admin/overview').then(r => setD(r.data.data)).catch(e => setErr(messageOf(e)));
    }, []);

    return (
        <>
            <h2>Overview</h2>
            {err && <p className="error">{err}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 13, margin: '20px 0' }}>
                {[['Published projects', d?.projects, FolderKanban], ['Achievements', d?.achievements, Trophy], ['Education records', d?.education, BookOpen], ['Contact messages', d?.messages, Mail]].map(([label, n, I]) =>
                    <div className="panel" key={label} style={{ padding: 18 }}><I color="#b5f36b" /><p className="muted" style={{ fontSize: 13 }}>{label}</p><strong style={{ fontSize: 27 }}>{n ?? '—'}</strong></div>
                )}
            </div>
            <div className="panel" style={{ padding: 20 }}>
                <h3>Recent messages</h3>
                {d?.recent?.length ? d.recent.map(m =>
                    <div key={m._id} style={{ padding: '12px 0', borderBottom: '1px solid #202922' }}>
                        <strong>{m.name}</strong> · <span className="muted">{m.subject}</span>
                        <p className="muted" style={{ fontSize: 12, margin: '5px 0' }}>{new Date(m.createdAt).toLocaleString()}</p>
                    </div>
                ) : <p className="muted">No messages yet.</p>}
            </div>
        </>
    );
}

function ProfileEditor({ onSaved }) {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        api.get('/admin/profile').then(r => setData(r.data.data)).catch(e => setErr(messageOf(e)));
    }, []);

    const fields = [['name', 'Name'], ['headline', 'Headline'], ['heroText', 'Hero introduction', 'long'], ['about', 'About', 'long'], ['email', 'Public email'], ['phone', 'Public phone (optional)'], ['location', 'Location'], ['githubUrl', 'GitHub URL'], ['linkedinUrl', 'LinkedIn URL'], ['availabilityLabel', 'Availability label'], ['available', 'Available for opportunities', 'bool'], ['photo', 'Profile photo', 'media']];

    return <Editor title="Profile" data={data} fields={fields} onChange={setData} onSave={async () => { await api.put('/admin/profile', data); onSaved(); setMsg('Profile saved.'); }} message={msg} error={err} />;
}

function SettingsEditor({ onSaved }) {
    const [data, setData] = useState(null);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        api.get('/admin/settings').then(r => setData(r.data.data)).catch(e => setErr(messageOf(e)));
    }, []);

    const fields = [['title', 'Website title'], ['description', 'Website description', 'long'], ['theme', 'Theme'], ['resumeVisible', 'Show public resume link', 'bool'], ['sectionVisibility', 'Homepage sections', 'visibility']];

    return <Editor title="Website settings" data={data} fields={fields} onChange={setData} onSave={async () => { await api.put('/admin/settings', data); onSaved(); setMsg('Settings saved.'); }} message={msg} error={err} />;
}

function Editor({ title, data, fields, onChange, onSave, message, error }) {
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState('');

    const save = async e => {
        e.preventDefault();
        setBusy(true);
        setSaveError('');
        try {
            await onSave();
        } catch (e) {
            setSaveError(messageOf(e));
        } finally {
            setBusy(false);
        }
    };

    if (!data) return <p className="muted">{error || 'Loading…'}</p>;

    return (
        <form className="panel" onSubmit={save} style={{ padding: 22, maxWidth: 850 }}>
            <h2>{title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 15 }}>
                {fields.map(f => <Field key={f[0]} field={f} value={data[f[0]]} onChange={v => onChange({ ...data, [f[0]]: v })} />)}
            </div>
            {(error || saveError) && <p className="error">{error || saveError}</p>}
            {message && <p className="notice">{message}</p>}
            <button className="btn btn-primary" style={{ marginTop: 18 }} disabled={busy}><Save size={15} />{busy ? 'Saving…' : 'Save changes'}</button>
        </form>
    );
}

function Crud({ resource, onSaved }) {
    const config = configs[resource];
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState('');

    const load = () => {
        setLoading(true);
        api.get(`/admin/${resource}`, { params: { search: query } })
            .then(r => setItems(r.data.data))
            .catch(e => setError(messageOf(e)))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [resource]);

    const filtered = useMemo(() => items.filter(i => {
        // LeetCode entries are managed in their own admin section.
        if (resource === 'projects' && String(i.category || '').toLowerCase().includes('leetcode')) return false;
        return `${i.name || i.title || i.role || i.subject || i.email || ''}`.toLowerCase().includes(query.toLowerCase());
    }), [items, query, resource]);

    const remove = async id => {
        if (!window.confirm('Delete this record? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/${resource}/${id}`);
            load();
            onSaved();
        } catch (e) {
            setError(messageOf(e));
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2>{config.title}</h2>
                {resource !== 'messages' && <button className="btn btn-primary" onClick={() => setEditing({})}><Plus size={15} /> Add {resource === 'projects' ? 'project' : 'record'}</button>}
            </div>
            <div style={{ display: 'flex', gap: 10, margin: '12px 0' }}>
                <input className="input" style={{ maxWidth: 350 }} placeholder="Search records…" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            {error && <p className="error">{error}</p>}
            {loading ? <p className="muted">Loading…</p> : (
                <div className="panel table-wrap">
                    <table className="admin-table">
                        <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item._id}>
                                    <td>
                                        <strong>{item.name || item.title || item.role || item.subject || item.email || 'Untitled'}</strong>
                                        {resource === 'messages' && <div className="muted" style={{ marginTop: 5, maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.message}</div>}
                                    </td>
                                    <td>{item.published ? 'Published' : item.read ? 'Read' : item.archived ? 'Archived' : 'Draft'}</td>
                                    <td className="muted">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 7 }}>
                                            <button className="btn" onClick={() => setEditing(item)}>Edit</button>
                                            <button className="btn" aria-label="Delete" onClick={() => remove(item._id)}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && <tr><td colSpan="4" className="muted">No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            {editing && <RecordModal resource={resource} initial={editing} close={() => setEditing(null)} saved={() => { setEditing(null); load(); onSaved(); }} />}
        </>
    );
}


const leetcodeFields = [
    ['name', 'Profile title'],
    ['shortDescription', 'Short description', 'long'],
    ['description', 'Detailed description', 'long'],
    ['liveUrl', 'LeetCode profile URL'],
    ['cover', 'Profile screenshot / photo', 'media'],
    ['technologies', 'Languages and topics (comma separated)', 'csv'],
    ['order', 'Display order', 'number'],
    ['published', 'Publish on portfolio', 'bool']
];

function LeetCodeManager({ onSaved }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/projects');
            const records = Array.isArray(response.data?.data) ? response.data.data : [];
            setItems(records.filter(item => String(item.category || '').toLowerCase().includes('leetcode')));
        } catch (e) {
            setError(messageOf(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => items.filter(item =>
        `${item.name || ''} ${item.shortDescription || ''} ${item.description || ''}`
            .toLowerCase().includes(query.toLowerCase())
    ), [items, query]);

    const addLeetCode = () => {
        setEditing({
            name: 'My LeetCode Profile',
            slug: 'leetcode-profile',
            category: 'LeetCode Profile',
            shortDescription: 'I practice Data Structures and Algorithms using Java.',
            description: '',
            liveUrl: '',
            technologies: ['Java', 'Data Structures', 'Algorithms'],
            order: 1,
            featured: false,
            published: true,
            cover: null
        });
    };

    const remove = async id => {
        if (!window.confirm('Delete this LeetCode entry? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/projects/${id}`);
            await load();
            onSaved();
        } catch (e) {
            setError(messageOf(e));
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ marginBottom: 6 }}>LeetCode Profile</h2>
                    <p className="muted" style={{ marginTop: 0 }}>Manage your LeetCode link, screenshot, description, languages, and visibility separately from regular projects.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={addLeetCode}><Plus size={15} /> Add LeetCode details</button>
            </div>

            <input
                className="input"
                style={{ maxWidth: 350, margin: '12px 0' }}
                placeholder="Search LeetCode entries…"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            {error && <p className="error">{error}</p>}

            {loading ? <p className="muted">Loading LeetCode details…</p> : (
                <div className="panel table-wrap">
                    <table className="admin-table">
                        <thead><tr><th>Profile</th><th>Screenshot</th><th>Status</th><th>Profile link</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(item => {
                                const imageUrl = typeof item.cover === 'string' ? item.cover : item.cover?.url;
                                return (
                                    <tr key={item._id}>
                                        <td>
                                            <strong>{item.name || 'LeetCode Profile'}</strong>
                                            <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>{item.shortDescription || ''}</div>
                                        </td>
                                        <td>{imageUrl ? <a href={imageUrl} target="_blank" rel="noreferrer">View image ↗</a> : 'No image'}</td>
                                        <td>{item.published === false ? 'Draft' : 'Published'}</td>
                                        <td>{item.liveUrl ? <a href={item.liveUrl} target="_blank" rel="noreferrer">Open profile ↗</a> : 'Not added'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 7 }}>
                                                <button type="button" className="btn" onClick={() => setEditing(item)}>Edit</button>
                                                <button type="button" className="btn" aria-label="Delete LeetCode entry" onClick={() => remove(item._id)}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!filtered.length && <tr><td colSpan="5" className="muted">No LeetCode entries yet. Click “Add LeetCode details” to create one.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <RecordModal
                    resource="projects"
                    initial={editing}
                    close={() => setEditing(null)}
                    saved={async () => { setEditing(null); await load(); onSaved(); }}
                    fieldsOverride={leetcodeFields}
                    modalTitle="LeetCode Details"
                    fixedCategory="LeetCode Profile"
                />
            )}
        </>
    );
}

function RecordModal({ resource, initial, close, saved, fieldsOverride, modalTitle, fixedCategory }) {
    const fields = fieldsOverride || configs[resource].fields;
    const [data, setData] = useState({ ...initial });
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async e => {
        e.preventDefault();
        setBusy(true);
        setErr('');

        try {
            const body = { ...data };
            delete body._id;
            delete body.createdAt;
            delete body.updatedAt;

            if (fixedCategory) {
                body.category = fixedCategory;
                if (!body.slug) body.slug = 'leetcode-profile';
            }

            if (initial._id) await api.put(`/admin/${resource}/${initial._id}`, body);
            else await api.post(`/admin/${resource}`, body);

            saved();
        } catch (e) {
            setErr(messageOf(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div onMouseDown={e => e.target === e.currentTarget && close()} style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#000b', display: 'grid', placeItems: 'center', padding: 16 }}>
            <form onSubmit={submit} className="panel" style={{ width: 'min(740px,100%)', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{initial._id ? 'Edit' : 'Add'} {modalTitle || configs[resource].title}</h2>
                    <button type="button" className="btn" onClick={close}><X size={16} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 13 }}>
                    {fields.map(f => <Field key={f[0]} field={f} value={data[f[0]]} onChange={v => setData({ ...data, [f[0]]: v })} />)}
                </div>
                {err && <p className="error">{err}</p>}
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button disabled={busy} className="btn btn-primary"><Save size={15} />{busy ? 'Saving…' : 'Save record'}</button>
                    <button type="button" className="btn" onClick={close}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

function Field({ field, value, onChange }) {
    const [name, label, type = 'text'] = field;
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState('');

    if (type === 'bool') return <label className="muted" style={{ fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />{label}</label>;

    if (type === 'visibility') return (
        <fieldset className="muted" style={{ fontSize: 13, gridColumn: '1/-1', border: '1px solid #29332c', borderRadius: 12, padding: 16 }}>
            <legend>{label}</legend>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {['about', 'skills', 'projects', 'achievements', 'contact'].map(key => <label key={key} style={{ display: 'flex', gap: 7, alignItems: 'center', textTransform: 'capitalize' }}><input type="checkbox" checked={value?.[key] !== false} onChange={e => onChange({ ...value, [key]: e.target.checked })} />{key}</label>)}
            </div>
        </fieldset>
    );

    if (type === 'media' || type === 'gallery') return (
        <label className="muted" style={{ fontSize: 13, gridColumn: '1/-1' }}>
            {label}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 7, flexWrap: 'wrap' }}>
                {type === 'media' && value?.url && <a target="_blank" rel="noreferrer" href={value.url} className="tag">Current file ↗</a>}
                {type === 'gallery' && (value || []).map((im, i) => <a key={i} target="_blank" rel="noreferrer" href={im.url} className="tag">Screenshot {i + 1} ↗</a>)}

                <input
                    type="file"
                    multiple={type === 'gallery'}
                    accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf"
                    onChange={async e => {
                        const files = [...(e.target.files || [])];
                        if (!files.length) return;

                        setUploading(true);
                        setErr('');

                        try {
                            const uploaded = [];

                            for (const file of files) {
                                // NEW: Apply the 3-minute limit only to the Video file field.
                                if (name === 'video' && file.type.startsWith('video/')) {
                                    const duration = await getVideoDuration(file);

                                    if (duration > 180) {
                                        throw new Error('Video must be 3 minutes or shorter. Please choose a shorter video.');
                                    }
                                }

                                // Apply the 100 MB per-file limit.
                                if (file.size > 100 * 1024 * 1024) {
                                    throw new Error(
                                        `${file.name} is larger than 100 MB. Please compress the file and try again.`
                                    );
                                }

                                const form = new FormData();
                                form.append('file', file);

                                const r = await api.post('/admin/media', form, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    },
                                    timeout: 120000
                                });

                                uploaded.push(r.data.data);
                            }

                            onChange(type === 'gallery' ? [...(value || []), ...uploaded] : uploaded[0]);
                        } catch (error) {
                            setErr(error?.message || messageOf(error));
                        } finally {
                            setUploading(false);
                            e.target.value = '';
                        }
                    }}
                />

                {uploading && <span className="muted">Checking video and uploading…</span>}
            </div>

            {err && <small className="error">{err}</small>}

            <small className="muted" style={{ display: 'block', marginTop: 5 }}>
                Images, video, or PDF. Maximum 100 MB per file. Video file: maximum 3 minutes. Configure Cloudinary on the server.
            </small>
        </label>
    );

    const val = type === 'list'
        ? Array.isArray(value) ? value.join('\n') : value || ''
        : type === 'csv'
            ? Array.isArray(value) ? value.join(', ') : value || ''
            : value ?? '';

    return (
        <label className="muted" style={{ fontSize: 13, gridColumn: type.startsWith('long') ? '1/-1' : undefined }}>
            {label}
            {type === 'long' || type === 'list' || type === 'longread' || name === 'message'
                ? <textarea
                    className="input"
                    rows={type === 'long' || type === 'longread' || name === 'message' ? 4 : 3}
                    style={{ display: 'block', marginTop: 7 }}
                    readOnly={type === 'longread' || type === 'readonly'}
                    required={!['description', 'problem', 'solution', 'contribution', 'message'].includes(name) && resourceRequired(field)}
                    value={val}
                    onChange={e => onChange(type === 'list' ? e.target.value.split('\n').filter(Boolean) : e.target.value)}
                />
                : <input
                    className="input"
                    style={{ display: 'block', marginTop: 7 }}
                    type={type === 'number' ? 'number' : 'text'}
                    readOnly={type === 'readonly'}
                    value={val}
                    onChange={e => onChange(type === 'number' ? Number(e.target.value) : type === 'csv' ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : e.target.value)}
                />
            }
        </label>
    );
}

function resourceRequired([name]) {
    return ['name', 'slug', 'title'].includes(name);
}

function Resume({ onSaved }) {
    const [profile, setProfile] = useState(null);
    const [settings, setSettings] = useState(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        Promise.all([api.get('/admin/profile'), api.get('/admin/settings')])
            .then(([p, s]) => {
                setProfile(p.data.data);
                setSettings(s.data.data);
            })
            .catch(e => setErr(messageOf(e)));
    }, []);

    const upload = async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBusy(true);
        setErr('');

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'portfolio/resume');

            const r = await api.post('/admin/media', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const next = { ...profile, resume: r.data.data };
            await api.put('/admin/profile', next);
            setProfile(next);
            setMsg('Resume uploaded and saved.');
            onSaved();
        } catch (e) {
            setErr(messageOf(e));
        } finally {
            setBusy(false);
        }
    };

    const toggle = async e => {
        const next = { ...settings, resumeVisible: e.target.checked };
        setSettings(next);
        try {
            await api.put('/admin/settings', next);
            onSaved();
        } catch (e) {
            setErr(messageOf(e));
        }
    };

    if (!profile) return <p className="muted">{err || 'Loading…'}</p>;

    return (
        <section className="panel" style={{ padding: 22, maxWidth: 700 }}>
            <h2>Media & resume</h2>
            <p className="muted">Resume file uploads are stored in Cloudinary. Only the current approved resume can be linked publicly.</p>
            {profile.resume?.url && <p><a className="btn" target="_blank" rel="noreferrer" href={profile.resume.url}>{profile.resume.format || 'Current resume'} ↗</a></p>}
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                <Upload size={15} />{busy ? 'Uploading…' : 'Upload / replace resume'}
                <input type="file" accept="application/pdf,.pdf" hidden onChange={upload} />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 24 }}>
                <input type="checkbox" checked={!!settings?.resumeVisible} onChange={toggle} />
                Show resume link on public portfolio
            </label>
            {msg && <p className="notice">{msg}</p>}
            {err && <p className="error">{err}</p>}
            <p className="muted" style={{ fontSize: 12 }}>PDF is recommended. Maximum upload size is 100 MB. Add Cloudinary credentials to enable uploads.</p>
        </section>
    );
}
