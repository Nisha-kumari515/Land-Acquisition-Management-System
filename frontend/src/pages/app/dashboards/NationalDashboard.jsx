import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../../../components/Map/MapContainer';
import { AlertCircle, ArrowRight, ShieldAlert, CheckCircle2, TrendingUp, Clock, FileText, Database } from 'lucide-react';

export default function NationalDashboard() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [national, setNational] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [assamMap, setAssamMap] = useState(null);

    useEffect(() => {
        Promise.all([
            fetchApi('/dashboard/overview'),
            fetchApi('/dashboard/national'),
            fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059').catch(() => null)
        ])
        .then(([overviewData, nationalData, mapData]) => {
            setOverview(overviewData);
            setNational(nationalData);
            
            if (mapData && mapData.features) {
                setAssamMap({
                    type: 'FeatureCollection',
                    features: mapData.features.map(f => ({
                        type: 'Feature',
                        properties: { dagNo: f.properties?.dag_no },
                        geometry: f.geometry
                    }))
                });
            } else {
                setAssamMap({ type: 'FeatureCollection', features: [] });
            }
        })
        .catch(err => {
            console.error(err);
            setError('Failed to load National Dashboard data from backend APIs.');
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">Loading National Command Center...</div>;
    if (error) return <div className="error">{error}</div>;

    const s = overview?.summary || {};
    const n = national || {};

    const formatCurrency = (val) => val ? `₹ ${(val / 100000).toFixed(2)} Lakhs` : 'N/A';
    
    // Compute some missing fields from available data where possible
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

    return (
        <div className="dashboard-page slide-in" style={{ paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database size={14} /> National Land Acquisition Command Center
                    </p>
                    <h1 className="page-title">National Overview</h1>
                </div>
            </header>

            {/* TOP KPI SECTION */}
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>Top KPIs</h2>
            </div>
            <div className="stats-grid mb-6">
                <div className="panel metric-card">
                    <p>Total Projects</p>
                    <h3>{s.totalProjects || 0}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Projects Active</p>
                    <h3>{s.activeProjects || 0}</h3>
                </div>
                <div className="panel metric-card">
                    <p>Affected Parcels</p>
                    <h3>{s.affectedParcels || 0}</h3>
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
                <div className="panel metric-card" style={{ border: '1px dashed var(--alert-500)', background: 'var(--alert-50)' }}>
                    <p style={{ color: 'var(--alert-700)' }}><AlertCircle size={14} style={{ display: 'inline' }}/> Missing API</p>
                    <small>Delayed Projects</small>
                </div>
            </div>

            {/* NATIONAL GIS COMMAND CENTER */}
            <div className="section-header" style={{ marginBottom: '1rem', marginTop: '3rem' }}>
                <h2>National GIS Command Center</h2>
                <p>Interactive spatial view. (Using existing OpenLayers component for viewport filtering)</p>
            </div>
            <div className="panel p-0" style={{ height: '500px', overflow: 'hidden', padding: 0 }}>
                {/* Passing empty for now so it loads the map and allows the user to browse/draw */}
                <MapContainer 
                    parcels={assamMap || { type: 'FeatureCollection', features: [] }}
                    projects={{ type: 'FeatureCollection', features: [] }}
                    affectedParcels={{ type: 'FeatureCollection', features: [] }}
                    onParcelSelect={() => {}}
                    isDrawing={false}
                    onDrawingComplete={() => {}}
                />
            </div>

            <div className="content-grid mt-6" style={{ marginTop: '2rem' }}>
                {/* STATE-WISE ANALYTICS */}
                <div className="panel">
                    <div className="panel-header">
                        <h2>State-wise Analytics</h2>
                    </div>
                    <div className="directory-table">
                        <div className="directory-row directory-row--header" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                            <span>State</span>
                            <span>Affected Parcels</span>
                            <span>Completed</span>
                        </div>
                        {n.stateProgress?.map(state => (
                            <button key={state.code} className="directory-row directory-row--button" style={{ gridTemplateColumns: '2fr 1fr 1fr' }} onClick={() => navigate(`/app/dashboard`)}>
                                <div><strong>{state.name}</strong><small>{state.code}</small></div>
                                <div>{state.affected_parcels}</div>
                                <div>{state.completed}</div>
                            </button>
                        ))}
                        {(!n.stateProgress || n.stateProgress.length === 0) && (
                            <div className="empty-state">No state progress data available.</div>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* COMPENSATION & R&R MONITORING */}
            <div className="content-grid mt-6" style={{ marginTop: '2rem' }}>
                <div className="panel">
                    <div className="panel-header">
                        <h2>Compensation Monitoring</h2>
                    </div>
                    <div className="stats-grid mt-4">
                        <div className="metric-card">
                            <p>Paid</p>
                            <h3>{compPaid}</h3>
                        </div>
                        <div className="metric-card">
                            <p>Pending</p>
                            <h3>{compPending}</h3>
                        </div>
                    </div>
                    <div className="empty-state mt-4" style={{ marginTop: '1rem' }}>
                        <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> Missing API: Assessed vs Approved vs Disbursed Values.</p>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <h2>R&R Monitoring</h2>
                    </div>
                    <div className="stats-grid mt-4">
                        <div className="metric-card">
                            <p>Families Completed</p>
                            <h3>{rrCompleted}</h3>
                        </div>
                        <div className="metric-card">
                            <p>Families Pending</p>
                            <h3>{s.pendingRR || 0}</h3>
                        </div>
                    </div>
                    <div className="empty-state mt-4" style={{ marginTop: '1rem' }}>
                        <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> Missing API: Displaced Families Count.</p>
                    </div>
                </div>
            </div>

            {/* NATIONAL ALERTS */}
            <div className="panel" style={{ marginTop: '2rem' }}>
                <div className="panel-header">
                    <h2>National Alerts</h2>
                </div>
                <div className="risk-list mt-4">
                    {overview.recentAlerts?.map(alert => (
                        <div key={alert.id} className="risk-row" onClick={() => navigate(`/app/parcels/${alert.projectParcel?.id}`)} style={{ cursor: 'pointer' }}>
                            <div>
                                <strong>{alert.project?.name} - {alert.projectParcel?.parcel?.village}</strong>
                                <small>{alert.reasons?.join(', ')}</small>
                            </div>
                            <span className="status status--alert">{alert.level} RISK</span>
                        </div>
                    ))}
                    {(!overview.recentAlerts || overview.recentAlerts.length === 0) && (
                        <div className="empty-state">No national alerts detected.</div>
                    )}
                </div>
            </div>

        </div>
    );
}
