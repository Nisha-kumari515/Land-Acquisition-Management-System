import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Activity, ShieldCheck, FileText, Database, Map as MapIcon, History, AlertTriangle } from 'lucide-react';
import MapContainer from '../../../components/Map/MapContainer';

export default function AuditorDashboard() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [stats, setStats] = useState({
        totalActions: 0,
        apiRequests: 0,
        authEvents: 0,
        dataMutations: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parcels, setParcels] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch audit logs
            let logsData = [];
            try {
                const res = await fetchApi('/audit?limit=20');
                logsData = Array.isArray(res) ? res : (res.data || res.logs || []);
                setAuditLogs(logsData);

                // Calculate simple stats
                const apiReqs = logsData.filter(l => l.entity === 'API_REQUEST').length;
                const auths = logsData.filter(l => l.action?.toLowerCase().includes('login')).length;
                const mutations = logsData.length - apiReqs - auths;

                setStats({
                    totalActions: logsData.length,
                    apiRequests: apiReqs,
                    authEvents: auths,
                    dataMutations: mutations
                });

            } catch (e) {
                console.warn('Could not fetch /audit', e);
            }

            // Fetch parcels for read-only map
            try {
                const pRes = await fetchApi('/parcels?limit=50');
                const pData = Array.isArray(pRes) ? pRes : (pRes.data || pRes.parcels || []);
                
                // Convert to GeoJSON FeatureCollection
                const features = pData.filter(p => p.coordinates).map(p => ({
                    type: 'Feature',
                    properties: { ...p },
                    geometry: p.coordinates
                }));
                
                setParcels({
                    type: 'FeatureCollection',
                    features
                });
            } catch (e) {
                console.warn('Could not fetch /parcels for map', e);
            }
            
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
                    <h1 className="page-title">Auditor Operations Center</h1>
                    <p className="page-subtitle">Read-only oversight of system activity, compliance, and geospatial data.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="status status--progress" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} /> Read-Only Mode
                    </div>
                </div>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            {/* KPIs */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Audited Actions</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.totalActions}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '8px' }}>
                        <History size={24} />
                    </div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>API Requests Logged</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>{stats.apiRequests}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '8px' }}>
                        <Activity size={24} />
                    </div>
                </div>
                <div className="stat-card" style={{ flex: 1, minWidth: '200px', padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Data Mutations</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning-600)' }}>{stats.dataMutations}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--warning-50)', color: 'var(--warning-600)', borderRadius: '8px' }}>
                        <Database size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                
                {/* Audit Logs Table */}
                <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <History size={20} className="text-primary-600" /> Recent System Activity
                        </h2>
                    </div>
                    {loading ? (
                        <div className="loading">Loading audit records...</div>
                    ) : (
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem 0.5rem' }}>Timestamp</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>User ID</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Action</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Entity</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No audit records found.</td>
                                        </tr>
                                    ) : (
                                        auditLogs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                                                    {log.userId || 'System'}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                                                    {log.action}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                                                    {log.entity}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem' }}>
                                                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--surface-500)' }}>
                                                        {JSON.stringify(log.newValue || log.previousValue || {})}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Read-Only Map */}
                <div className="panel" style={{ padding: '1.5rem', background: 'var(--surface-50)', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapIcon size={20} className="text-primary-600" /> Read-Only Parcel Viewer
                        </h2>
                    </div>
                    <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-200)' }}>
                        <MapContainer 
                            parcels={parcels}
                            onParcelSelect={() => {}}
                            isDrawing={false}
                            onDrawingComplete={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
