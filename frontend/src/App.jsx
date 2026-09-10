import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3105/api';

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const statusTone = {
    ACTIVE: 'status status--active',
    PLANNED: 'status status--planned',
    IN_PROGRESS: 'status status--progress',
    COMPLETED: 'status status--done',
    DELAYED: 'status status--alert',
    HIGH: 'status status--alert',
    MEDIUM: 'status status--progress',
    LOW: 'status status--done',
};

function App() {
    const [overview, setOverview] = useState(null);
    const [projects, setProjects] = useState([]);
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError('');

            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@bhoomisetu.demo',
                    password: 'demo-admin-password',
                }),
            });

            if (!loginResponse.ok) {
                throw new Error('Unable to authenticate with the demo backend user.');
            }

            const loginData = await loginResponse.json();
            const token = loginData.data?.token;
            const headers = { Authorization: `Bearer ${token}` };

            const [overviewRes, projectsRes, risksRes] = await Promise.all([
                fetch(`${API_BASE}/dashboard/overview`, { headers }),
                fetch(`${API_BASE}/dashboard/projects`, { headers }),
                fetch(`${API_BASE}/risks`, { headers }),
            ]);

            if (!overviewRes.ok || !projectsRes.ok || !risksRes.ok) {
                throw new Error('One or more dashboard API requests failed.');
            }

            const overviewData = await overviewRes.json();
            const projectsData = await projectsRes.json();
            const risksData = await risksRes.json();

            setOverview(overviewData.data?.summary || overviewData.summary || overviewData.data || overviewData);
            setProjects(projectsData.data || projectsData);
            setRisks(risksData.data || risksData);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Unable to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }

    const projectCards = useMemo(() => {
        if (!projects || !Array.isArray(projects)) return [];
        return projects
            .filter((project) => projectFilter === 'ALL' || project.status === projectFilter)
            .slice(0, 6);
    }, [projectFilter, projects]);

    const riskItems = useMemo(() => {
        if (!risks || !Array.isArray(risks)) return [];
        return risks.slice(0, activeView === 'risks' ? 12 : 4);
    }, [activeView, risks]);

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) ?? null,
        [projects, selectedProjectId],
    );

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <p className="eyebrow">Land Acquisition Control Tower</p>
                    <h1>BHOOMISETU</h1>
                </div>
                <div className="topbar-actions">
                    <span className="sync-state"><span className="sync-dot" /> Live monitoring</span>
                    <button className="primary-btn" onClick={loadDashboard} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh data'}
                    </button>
                </div>
            </header>

            <nav className="view-nav" aria-label="Dashboard sections">
                {[
                    ['overview', 'Overview'],
                    ['projects', 'Projects'],
                    ['risks', 'Risk alerts'],
                ].map(([view, label]) => (
                    <button
                        key={view}
                        className={`view-tab ${activeView === view ? 'view-tab--active' : ''}`}
                        onClick={() => setActiveView(view)}
                    >
                        {label}
                        {view === 'risks' && risks.length > 0 && <span className="tab-count">{risks.length}</span>}
                    </button>
                ))}
            </nav>

            {loading ? (
                <div className="panel loading">Loading dashboard data...</div>
            ) : error ? (
                <div className="panel error">{error}</div>
            ) : (
                <>
                    {activeView === 'overview' && <section className="stats-grid">
                        <MetricCard label="Total Projects" value={overview?.totalProjects ?? 0} helper="Across all acquisition districts" />
                        <MetricCard label="Affected Parcels" value={overview?.affectedParcels ?? 0} helper="Under active review" />
                        <MetricCard label="Pending Compensation" value={overview?.pendingCompensation ?? 0} helper="Cases awaiting action" />
                        <MetricCard label="High Risk Alerts" value={overview?.highRiskAlerts ?? 0} helper="Needs attention" />
                    </section>}

                    {(activeView === 'overview' || activeView === 'projects') && <section className="content-grid">
                        <div className="panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Project Pipeline</h2>
                                    <small className="panel-subtitle">
                                        {lastUpdated ? `Synced ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live operational view'}
                                    </small>
                                </div>
                                <label className="filter-control">
                                    <span className="sr-only">Filter projects by status</span>
                                    <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
                                        <option value="ALL">All projects</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="PLANNED">Planned</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </label>
                            </div>

                            <div className="project-list">
                                {projectCards.length > 0 ? projectCards.map((project) => (
                                    <div key={project.id} className="project-row">
                                        <div>
                                            <strong>{project.name}</strong>
                                            <small>{project.district || project.department || 'Assam District'}</small>
                                        </div>
                                        <div className="project-meta">
                                            <span className={statusTone[project.status] || 'status'}>{project.status}</span>
                                            <small>{project.parcelCount || 0} parcels</small>
                                        </div>
                                    </div>
                                )) : <div className="empty-state">No projects match this filter.</div>}
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel-header">
                                <h2>Risk Intelligence</h2>
                                <span className="chip chip-alert">Priority</span>
                            </div>

                            <div className="risk-list">
                                {riskItems.map((risk) => (
                                    <div key={risk.id} className="risk-row">
                                        <div className="risk-head">
                                            <strong>{risk.project?.name || 'Risk Alert'}</strong>
                                            <span className={statusTone[risk.level] || 'status'}>{risk.level}</span>
                                        </div>
                                        <p>{risk.recommendedAction || risk.reasons?.[0] || 'Review pending.'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>}

                    {activeView === 'projects' && (
                        <>
                            <ProjectDirectory
                                projects={projects}
                                selectedProjectId={selectedProjectId}
                                onSelect={setSelectedProjectId}
                            />
                            {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProjectId(null)} />}
                        </>
                    )}

                    {activeView === 'risks' && (
                        <section className="panel expanded-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Risk Alert Register</h2>
                                    <small className="panel-subtitle">Explainable alerts from the latest evaluation cycle</small>
                                </div>
                                <span className="chip chip-alert">{risks.length} alerts</span>
                            </div>
                            <div className="risk-register">
                                {riskItems.map((risk) => (
                                    <div key={risk.id} className="risk-register-row">
                                        <div>
                                            <strong>{risk.project?.name || 'Unassigned project'}</strong>
                                            <p>{risk.reasons?.join(' · ') || 'Review pending.'}</p>
                                        </div>
                                        <div className="risk-register-meta">
                                            <span className={statusTone[risk.level] || 'status'}>{risk.level}</span>
                                            <small>Score {risk.score ?? 0}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

function ProjectDirectory({ projects, selectedProjectId, onSelect }) {
    return (
        <section className="panel expanded-panel">
            <div className="panel-header">
                <div>
                    <h2>Project Directory</h2>
                    <small className="panel-subtitle">Portfolio-level acquisition progress</small>
                </div>
                <span className="chip">{projects.length} projects</span>
            </div>
            <div className="directory-table" role="table" aria-label="Project directory">
                <div className="directory-row directory-row--header" role="row">
                    <span>Project</span><span>Status</span><span>Parcels</span><span>Risk mix</span>
                </div>
                {projects.map((project) => (
                    <button
                        className={`directory-row directory-row--button ${selectedProjectId === project.id ? 'directory-row--selected' : ''}`}
                        type="button"
                        role="row"
                        key={project.id}
                        onClick={() => onSelect(project.id)}
                    >
                        <div><strong>{project.name}</strong><small>{project.code} · {project.district || 'Assam'}</small></div>
                        <span className={statusTone[project.status] || 'status'}>{project.status}</span>
                        <strong>{project.parcelCount || 0}</strong>
                        <small className="risk-mix">{project.riskSummary?.high || 0} high / {project.riskSummary?.medium || 0} med / {project.riskSummary?.low || 0} low</small>
                    </button>
                ))}
            </div>
        </section>
    );
}

function ProjectDetail({ project, onClose }) {
    const [intel, setIntel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchIntel() {
            setLoading(true);
            try {
                // Find token from local storage or use existing fetch logic. For now, assume App passed token. 
                // Since token isn't passed, let's fetch using the backend's demo auth.
                const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' }),
                });
                const token = (await loginResponse.json()).data?.token;
                
                const res = await fetch(`${API_BASE}/projects/${project.id}/intelligence`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setIntel(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchIntel();
    }, [project.id]);

    if (loading) return <section className="panel expanded-panel project-detail"><div className="loading">Loading intelligence...</div></section>;

    return (
        <section className="panel expanded-panel project-detail slide-in">
            <div className="panel-header">
                <div>
                    <p className="eyebrow">Project Intelligence Overview</p>
                    <h2>{project.name}</h2>
                    <small className="panel-subtitle">{project.code} · {project.district || 'Assam District'} · {project.department}</small>
                </div>
                <button className="quiet-btn" type="button" onClick={onClose}>Close</button>
            </div>
            
            <div className="detail-grid">
                <div className="detail-stat"><small>Affected Area</small><strong>{intel?.totalAffectedArea ? (intel.totalAffectedArea / 10000).toFixed(2) : 0} Ha</strong></div>
                <div className="detail-stat"><small>Total Parcels</small><strong>{intel?.totalParcels || project.parcelCount || 0}</strong></div>
                <div className="detail-stat"><small>Assessed Comp.</small><strong>{formatCurrency(intel?.totalAssessedCompensation)}</strong></div>
                <div className="detail-stat"><small>High Risk Factors</small><strong className="alert-text">{intel?.riskSummary?.high || 0}</strong></div>
            </div>

            <div className="content-grid" style={{ marginTop: '1.5rem', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <h3>Acquisition Stages</h3>
                    <div className="stage-list">
                        {intel?.stageDistribution ? Object.entries(intel.stageDistribution).map(([stage, count]) => (
                            <div className="stage-row" key={stage}>
                                <span>{stage.replaceAll('_', ' ')}</span>
                                <span className="stage-bar"><span style={{ width: `${Math.min((count / Math.max(intel.totalParcels, 1)) * 100, 100)}%` }} /></span>
                                <strong>{count}</strong>
                            </div>
                        )) : <div className="empty-state">No stages initiated yet.</div>}
                    </div>
                </div>
                <div>
                    <h3>Key Risks</h3>
                    <div className="risk-list">
                        {intel?.highRiskParcels?.length > 0 ? intel.highRiskParcels.map(rp => (
                            <div key={rp.id} className="risk-row">
                                <div><strong>Dag No. {rp.dagNo}</strong><small>{rp.village}</small></div>
                                <span className="status status--alert">HIGH</span>
                            </div>
                        )) : <div className="empty-state">No high risks detected.</div>}
                    </div>
                </div>
            </div>
        </section>
    );
}

function MetricCard({ label, value, helper }) {
    return (
        <div className="metric-card panel">
            <p>{label}</p>
            <h3>{value}</h3>
            <small>{helper}</small>
        </div>
    );
}

export default App;
