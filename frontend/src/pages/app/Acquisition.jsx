import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { Briefcase, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Acquisition() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/projects');
            setWorkflows(Array.isArray(response) ? response : (response.data || []));
        } catch (err) {
            setError(err.message || 'Failed to load acquisition workflows');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <h1 className="page-title">Acquisition Workflows</h1>
                <p className="page-subtitle">Track and manage active land acquisitions under RFCTLARR Act.</p>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Active Acquisitions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{workflows.length}</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Pending Sec 11</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-600)' }}>3</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Completed Awards</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>0</div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading acquisition workflows...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>Project ID</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Stage</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>SLA Status</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {workflows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No acquisition workflows found.</td>
                                    </tr>
                                ) : (
                                    workflows.map(wf => (
                                        <tr key={wf.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontFamily: 'monospace' }}>{wf.id.split('-')[0]}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <div style={{ fontWeight: 500 }}>{wf.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--surface-500)' }}>{wf.state} • {wf.district}</div>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className="status status--active">{wf.status || 'INITIAL'}</span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-600)', fontSize: '0.875rem' }}>
                                                    <CheckCircle size={14} /> On Track
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <Link to={`/app/projects/${wf.id}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    Manage <ArrowRight size={14} />
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
