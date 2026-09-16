import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../../../components/Map/MapContainer';
import { AlertCircle, ShieldAlert, Clock, Map as MapIcon, CheckSquare } from 'lucide-react';

export default function DistrictDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.districtId) return;
        
        Promise.all([
            fetchApi(`/dashboard/district/${user.districtId}`),
            fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059').catch(() => null)
        ])
        .then(([statsData, mapResponse]) => {
            setStats(statsData);
            
            if (mapResponse && mapResponse.features) {
                setMapData({
                    type: 'FeatureCollection',
                    features: mapResponse.features.map(f => ({
                        type: 'Feature',
                        properties: { dagNo: f.properties?.dag_no },
                        geometry: f.geometry
                    }))
                });
            } else {
                setMapData({ type: 'FeatureCollection', features: [] });
            }
        })
        .catch(err => {
            console.error(err);
            setError('Failed to load District Dashboard data from backend APIs.');
        })
        .finally(() => setLoading(false));
    }, [user?.districtId]);

    if (loading) return <div className="loading">Loading District Command Center...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stats) return <div className="error">Failed to load dashboard data.</div>;

    const s = stats || {};

    return (
        <div className="dashboard-page slide-in" style={{ paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapIcon size={14} /> District Command Center
                    </p>
                    <h1 className="page-title">{user?.district?.name || 'District'} Overview</h1>
                </div>
            </header>

            {/* TOP KPI SECTION */}
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>District KPIs</h2>
            </div>
            <div className="stats-grid mb-6">
                <div className="panel metric-card">
                    <p>Total Projects</p>
                    <h3>{s.totalProjects || 0}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Total Parcels</p>
                    <h3>{s.totalParcels || 0}</h3>
                </div>
                
                {/* Missing Backend KPIs required by prompt */}
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Data not provided by API</p>
                    <small>Land Proposed (Area)</small>
                </div>
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Data not provided by API</p>
                    <small>Land Notified (Area)</small>
                </div>
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Data not provided by API</p>
                    <small>Compensation Disbursed</small>
                </div>
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Data not provided by API</p>
                    <small>Fund Utilization</small>
                </div>
            </div>

            {/* DISTRICT GIS COMMAND CENTER */}
            <div className="section-header" style={{ marginBottom: '1rem', marginTop: '3rem' }}>
                <h2>District GIS Command Center</h2>
                <p>Interactive spatial view of district parcels.</p>
            </div>
            <div className="panel p-0" style={{ height: '500px', overflow: 'hidden', padding: 0 }}>
                <MapContainer 
                    parcels={mapData || { type: 'FeatureCollection', features: [] }}
                    projects={{ type: 'FeatureCollection', features: [] }}
                    affectedParcels={{ type: 'FeatureCollection', features: [] }}
                    onParcelSelect={() => {}}
                    isDrawing={false}
                    onDrawingComplete={() => {}}
                />
            </div>

            <div className="content-grid mt-6" style={{ marginTop: '2rem' }}>
                {/* PROJECT OPERATIONS */}
                <div className="panel">
                    <div className="panel-header">
                        <h2>Project Operations</h2>
                    </div>
                    <div className="directory-table">
                        <div className="directory-row directory-row--header" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <span>Project Name</span>
                            <span>Department</span>
                            <span>Status</span>
                        </div>
                        {s.activeProjects?.map(p => (
                            <button key={p.id} className="directory-row directory-row--button" style={{ gridTemplateColumns: '2fr 1fr 1fr' }} onClick={() => navigate(`/app/projects/${p.id}`)}>
                                <div><strong>{p.name}</strong></div>
                                <div>{p.department || <span style={{ color: 'var(--alert-600)' }}><AlertCircle size={12} style={{ display: 'inline' }}/> Data not provided by API</span>}</div>
                                <div><span className="status status--active">{p.status}</span></div>
                            </button>
                        ))}
                        {(!s.activeProjects || s.activeProjects.length === 0) && (
                            <div className="empty-state">No assigned projects in this district.</div>
                        )}
                    </div>
                </div>

                {/* TASK CENTER, RISK & TIMELINE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* TASK CENTER */}
                    <div className="panel">
                        <div className="panel-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={16} /> Task Center (Pending Approvals)</h2>
                        </div>
                        <div className="empty-state mt-4">
                            <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> Data not provided by API</p>
                        </div>
                    </div>

                    {/* RISK MONITORING */}
                    <div className="panel">
                        <div className="panel-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={16} /> Risk</h2>
                        </div>
                        <div className="empty-state mt-4">
                            <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> Data not provided by API</p>
                        </div>
                    </div>
                    
                    {/* TIMELINE MONITORING */}
                    <div className="panel">
                        <div className="panel-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Timeline Monitoring</h2>
                        </div>
                        <div className="empty-state mt-4">
                            <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> Data not provided by API</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
