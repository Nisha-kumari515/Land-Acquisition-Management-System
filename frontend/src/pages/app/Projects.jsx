import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            // Default params, adjust as needed
            const response = await fetchApi('/projects?page=1&limit=50');
            // The response from fetchApi unwraps data, returning { items, pagination }
            setProjects(response?.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Project Directory</h1>
                    <p className="page-subtitle">Manage and monitor land acquisition projects.</p>
                </div>
                <Link to="/app/projects/new" className="primary-btn"><Plus size={16} /> New Project</Link>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
                        <input type="text" placeholder="Search projects by code, name or department..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }} />
                    </div>
                    <button className="secondary-btn"><Filter size={16} /> Filters</button>
                </div>

                {loading ? (
                    <div className="loading">Loading projects...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>CODE</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>PROJECT NAME</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>DEPARTMENT</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>AFFECTED AREA (Ha)</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No projects found.</td>
                                    </tr>
                                ) : (
                                    projects.map(proj => (
                                        <tr key={proj.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{proj.code}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{proj.name}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{proj.department}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className={`status status--${proj.status === 'ACTIVE' ? 'active' : 'draft'}`}>
                                                    {proj.status || 'DRAFT'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{proj.totalAreaAffected || '0.00'}</td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <Link to={`/app/projects/${proj.id}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    View <ArrowRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
