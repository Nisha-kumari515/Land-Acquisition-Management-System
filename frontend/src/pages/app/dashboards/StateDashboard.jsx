import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../../../components/Map/MapContainer';
import { AlertCircle, MapPin, Database } from 'lucide-react';

export default function StateDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stateMap, setStateMap] = useState(null);

    useEffect(() => {
        if (!user?.stateId) {
            setLoading(false);
            return;
        }

        Promise.all([
            fetchApi(`/dashboard/state/${user.stateId}`),
            fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059').catch(() => null)
        ])
        .then(([statsData, mapData]) => {
            setStats(statsData);
            
            if (mapData && mapData.features) {
                setStateMap({
                    type: 'FeatureCollection',
                    features: mapData.features.map(f => ({
                        type: 'Feature',
                        properties: { dagNo: f.properties?.dag_no },
                        geometry: f.geometry
                    }))
                });
            } else {
                setStateMap({ type: 'FeatureCollection', features: [] });
            }
        })
        .catch(err => {
            console.error(err);
            setError('Failed to load State Dashboard data from backend APIs.');
        })
        .finally(() => setLoading(false));
    }, [user?.stateId]);

    if (loading) return <div className="loading">Loading State Command Center...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stats) return <div className="error">Failed to load dashboard data.</div>;

    const n = stats || {};

    const stageMap = {};
    n.stageDistribution?.forEach(d => { stageMap[d.stage] = d.count; });
    
    const compMap = {};
    n.compensationDistribution?.forEach(d => { compMap[d.status] = d.count; });
    
    const rrMap = {};
    n.rrStatus?.forEach(d => { rrMap[d.status] = d.count; });

    const totalAcquiredParcels = stageMap['COMPLETED'] || 0;
    const compPaid = compMap['PAID'] || 0;
    const compPending = compMap['PENDING'] || 0;
    const rrCompleted = rrMap['COMPLETED'] || 0;
    
    // Derived missing data from response if not present
    const totalProjects = n.totalProjects ?? 'Data not provided by API';
    const totalParcels = n.totalParcels ?? 'Data not provided by API';
    
    return (
        <div className="dashboard-page slide-in" style={{ paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} /> State Land Acquisition Command Center
                    </p>
                    <h1 className="page-title">{user?.state?.name || 'State'} Overview</h1>
                </div>
            </header>

            {/* TOP KPI SECTION */}
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>Top KPIs</h2>
            </div>
            <div className="stats-grid mb-6">
                <div className="panel metric-card">
                    <p>Total Projects</p>
                    <h3>{totalProjects}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Affected Parcels</p>
                    <h3>{totalParcels}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Parcels Acquired</p>
                    <h3>{totalAcquiredParcels}</h3>
                </div>
                
                {/* Missing Backend KPIs required by prompt */}
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Missing API</p>
                    <small>Land Proposed (Area)</small>
                </div>
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Missing API</p>
                    <small>Land Notified (Area)</small>
                </div>
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Missing API</p>
                    <small>Compensation Assessed (Value)</small>
                </div>
            </div>

            {/* STATE GIS COMMAND CENTER */}
            <div className="section-header" style={{ marginBottom: '1rem', marginTop: '3rem' }}>
                <h2>State GIS Command Center</h2>
                <p>Interactive spatial view. (Using existing OpenLayers component for viewport filtering)</p>
            </div>
            <div className="panel p-0" style={{ height: '500px', overflow: 'hidden', padding: 0 }}>
                <MapContainer 
                    parcels={stateMap || { type: 'FeatureCollection', features: [] }}
                    projects={{ type: 'FeatureCollection', features: [] }}
                    affectedParcels={{ type: 'FeatureCollection', features: [] }}
                    onParcelSelect={() => {}}
                    isDrawing={false}
                    onDrawingComplete={() => {}}
                />
            </div>

            <div className="content-grid mt-6" style={{ marginTop: '2rem' }}>
                {/* DISTRICT-WISE ANALYTICS */}
                <div className="panel">
                    <div className="panel-header">
                        <h2>District Performance</h2>
                    </div>
                    <div className="directory-table">
                        <div className="directory-row directory-row--header" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <span>District</span>
                            <span>Affected Area</span>
                            <span>Status</span>
                        </div>
                        {n.districtLand?.map(district => (
                            <button key={district.code} className="directory-row directory-row--button" style={{ gridTemplateColumns: '2fr 1fr 1fr' }} onClick={() => navigate(`/app/dashboard`)}>
                                <div><strong>{district.name}</strong><small>{district.code}</small></div>
                                <div>{district.total_area ? `${district.total_area} sq m` : 'N/A'}</div>
                                <div>Data not provided by API</div>
                            </button>
                        ))}
                        {(!n.districtLand || n.districtLand.length === 0) && (
                            <div className="empty-state">No district performance data available.</div>
                        )}
                    </div>
                </div>

                {/* PROJECT PROGRESS & ALERTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="panel">
                        <div className="panel-header">
                            <h2>Project Progress</h2>
                        </div>
                        <div className="stage-list">
                            {n.stageDistribution?.map(stage => (
                                <div key={stage.stage} className="stage-row" style={{ gridTemplateColumns: '1fr 60px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{stage.stage.replace('_', ' ')}</span>
                                    <span style={{ textAlign: 'right', fontWeight: 700 }}>{stage.count}</span>
                                </div>
                            ))}
                            {(!n.stageDistribution || n.stageDistribution.length === 0) && (
                                <div className="empty-state">No project progress data available.</div>
                            )}
                        </div>
                    </div>

                    {/* RISK COMMAND CENTER */}
                    <div className="panel">
                        <div className="panel-header">
                            <h2>Risk Command Center</h2>
                        </div>
                        <div className="stage-list">
                            {n.riskDistribution?.map(risk => (
                                <div key={risk.level} className="stage-row" style={{ gridTemplateColumns: '1fr 60px' }}>
                                    <span className={`status status--${risk.level === 'HIGH' ? 'alert' : risk.level === 'MEDIUM' ? 'progress' : 'done'}`}>
                                        {risk.level}
                                    </span>
                                    <span style={{ textAlign: 'right', fontWeight: 700 }}>{risk.count}</span>
                                </div>
                            ))}
                            {(!n.riskDistribution || n.riskDistribution.length === 0) && (
                                <div className="empty-state">No risk distribution data available.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ALERTS */}
            <div className="panel" style={{ marginTop: '2rem' }}>
                <div className="panel-header">
                    <h2>State Alerts & Bottlenecks</h2>
                </div>
                <div className="risk-list mt-4">
                    {n.bottlenecks?.map(b => (
                        <div key={b.id} className="risk-row" onClick={() => navigate(`/app/projects/${b.id}`)} style={{ cursor: 'pointer' }}>
                            <div>
                                <strong>{b.name}</strong>
                                <small>{b.code}</small>
                            </div>
                            <span className="status status--alert">{b.high_risk} HIGH RISK</span>
                        </div>
                    ))}
                    {(!n.bottlenecks || n.bottlenecks.length === 0) && (
                        <div className="empty-state">No bottlenecks detected.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
