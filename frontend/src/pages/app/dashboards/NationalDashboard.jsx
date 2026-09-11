import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';

export default function NationalDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/dashboard/national')
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">Loading National Dashboard...</div>;
    if (!stats) return <div className="error">Failed to load dashboard data.</div>;

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">National Acquisition Command Center</p>
                    <h1 className="page-title">National Overview</h1>
                </div>
            </header>

            <div className="stats-grid mt-6">
                <div className="panel metric-card">
                    <p>Total Projects</p>
                    <h3>{stats.totalProjects}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Total Parcels</p>
                    <h3>{stats.totalParcels}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Affected Area</p>
                    <h3>{(stats.totalAffectedArea / 10000).toFixed(2)} Ha</h3>
                </div>
                <div className="panel metric-card">
                    <p>Total Compensation</p>
                    <h3>₹ {(stats.totalCompensation / 10000000).toFixed(2)} Cr</h3>
                </div>
            </div>

            <div className="content-grid mt-6">
                <div className="panel">
                    <div className="panel-header">
                        <h2>Recent Active Projects</h2>
                    </div>
                    <div className="project-list">
                        {stats.activeProjects?.map(p => (
                            <div key={p.id} className="project-row">
                                <div>
                                    <strong>{p.name}</strong>
                                    <small>{p.department}</small>
                                </div>
                                <span className={`status status--${p.status === 'ACTIVE' ? 'active' : 'progress'}`}>
                                    {p.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <h2>Critical Risk Alerts</h2>
                    </div>
                    <div className="risk-list">
                        {stats.highRiskProjects?.map(r => (
                            <div key={r.id} className="risk-row">
                                <div>
                                    <strong>{r.name}</strong>
                                    <small>{r.department}</small>
                                </div>
                                <span className="status status--alert">RISK</span>
                            </div>
                        ))}
                        {(!stats.highRiskProjects || stats.highRiskProjects.length === 0) && (
                            <div className="empty-state">No high risk projects detected.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
