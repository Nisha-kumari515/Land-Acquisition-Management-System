import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function DistrictDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.districtId) return;
        fetchApi(`/dashboard/district/${user.districtId}`)
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user.districtId]);

    if (loading) return <div className="loading">Loading District Dashboard...</div>;
    if (!stats) return <div className="error">Failed to load dashboard data.</div>;

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">District Operations Dashboard</p>
                    <h1 className="page-title">{user.district?.name || 'District'} Overview</h1>
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
            </div>
            
            <div className="panel mt-6">
                <div className="panel-header">
                    <h2>Assigned Projects</h2>
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
                        <div className="empty-state">No assigned projects in this district.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
