import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function StateDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.stateId) return;
        fetchApi(`/dashboard/state/${user.stateId}`)
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user.stateId]);

    if (loading) return <div className="loading">Loading State Dashboard...</div>;
    if (!stats) return <div className="error">Failed to load dashboard data.</div>;

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">State Acquisition Dashboard</p>
                    <h1 className="page-title">{user.state?.name || 'State'} Overview</h1>
                </div>
            </header>

            <div className="stats-grid mt-6">
                <div className="panel metric-card">
                    <p>Total Projects in State</p>
                    <h3>{stats.totalProjects}</h3>
                </div>
                <div className="panel metric-card">
                    <p>State Parcels</p>
                    <h3>{stats.totalParcels}</h3>
                </div>
                <div className="panel metric-card">
                    <p>High Risk Projects</p>
                    <h3>{stats.highRiskProjects?.length || 0}</h3>
                </div>
            </div>
            
            <div className="panel mt-6">
                <div className="panel-header">
                    <h2>Active Projects</h2>
                </div>
                <div className="project-list">
                    {stats.activeProjects?.map(p => (
                        <div key={p.id} className="project-row">
                            <div>
                                <strong>{p.name}</strong>
                                <small>{p.department}</small>
                            </div>
                            <span className="status status--active">{p.status}</span>
                        </div>
                    ))}
                    {(!stats.activeProjects || stats.activeProjects.length === 0) && (
                        <div className="empty-state">No active projects.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
