import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { IndianRupee, FileText, CheckCircle, AlertTriangle, TrendingUp, Users, Activity, BarChart3, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FinanceDashboard() {
    const [stats, setStats] = useState({
        totalAssessed: 0,
        approved: 0,
        disbursed: 0,
        pending: 0
    });
    const [projects, setProjects] = useState([]);
    const [compensations, setCompensations] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Attempt to fetch from /compensation API
            let compData = [];
            try {
                const res = await fetchApi('/compensation?limit=10');
                compData = Array.isArray(res) ? res : (res.data || res.compensations || []);
            } catch (e) {
                console.warn('Could not fetch /compensation', e);
            }
            
            setCompensations(compData);
            
            setStats({
                totalAssessed: 0,
                approved: 0,
                disbursed: 0,
                pending: 0
            });
            
            setProjects([]);
            setAlerts([]);
            
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Finance Control Center</h1>
                    <p className="page-subtitle">Real-time overview of financial assessments, compensation, and disbursements.</p>
                </div>
                <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} /> Generate Report
                </button>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* KPIs */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Assessed</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.totalAssessed}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '8px' }}>
                        <BarChart3 size={24} />
                    </div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Approved</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>{stats.approved}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '8px' }}>
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Pending</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning-600)' }}>{stats.pending}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--warning-50)', color: 'var(--warning-600)', borderRadius: '8px' }}>
                        <Activity size={24} />
                    </div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Disbursed</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success-600)' }}>{stats.disbursed}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--success-50)', color: 'var(--success-600)', borderRadius: '8px' }}>
                        <IndianRupee size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Projects Overview */}
                    <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} className="text-primary-600" /> Project Budgets
                        </h2>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem 0.5rem' }}>Project Name</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Total Budget</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Utilized</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(proj => (
                                        <tr key={proj.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{proj.name}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{proj.budget}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{proj.utilized}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className={`status status--${proj.status.toLowerCase().replace(' ', '-')}`}>
                                                    {proj.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={20} className="text-warning-600" /> Alerts & Notifications
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {alerts.length === 0 ? (
                                <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>No new alerts.</p>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert.id} style={{ padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${alert.type === 'warning' ? 'var(--warning-500)' : 'var(--primary-500)'}`, background: 'var(--surface-100)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        {alert.type === 'warning' ? <AlertTriangle size={18} className="text-warning-600" style={{ flexShrink: 0, marginTop: '2px' }} /> : <Bell size={18} className="text-primary-600" style={{ flexShrink: 0, marginTop: '2px' }} />}
                                        <p style={{ fontSize: '0.875rem', color: 'var(--surface-800)', margin: 0, lineHeight: 1.4 }}>{alert.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Compensation Table */}
                <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} className="text-primary-600" /> Recent Compensations
                        </h2>
                        <Link to="/app/compensation" style={{ color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 500 }}>View All</Link>
                    </div>
                    {loading ? (
                        <div className="loading">Loading records...</div>
                    ) : (
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem 0.5rem' }}>DAG NO</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Owner</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Amount</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                        <th style={{ padding: '1rem 0.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compensations.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No records found.</td>
                                        </tr>
                                    ) : (
                                        compensations.map(comp => (
                                            <tr key={comp.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{comp.dagNo || 'N/A'}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{comp.ownerName || 'N/A'}</td>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>
                                                    {comp.amount ? `₹ ${comp.amount.toLocaleString('en-IN')}` : 'Calculating'}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span className={`status status--${(comp.status || 'pending').toLowerCase()}`}>
                                                        {comp.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                    <button className="primary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                        Review
                                                    </button>
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
        </div>
    );
}
