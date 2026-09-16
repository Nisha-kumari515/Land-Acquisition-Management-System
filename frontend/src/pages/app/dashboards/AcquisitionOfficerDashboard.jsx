import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import MapContainer from '../../../components/Map/MapContainer';
import { Activity, Users, CheckCircle, ArrowRight, Map as MapIcon, AlertCircle, FileText, CheckSquare, ShieldAlert, Clock } from 'lucide-react';

export default function AcquisitionOfficerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [stats, setStats] = useState(null);
    const [parcels, setParcels] = useState([]);
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch data: Dashboard stats, Parcel Task List, and Map features
        Promise.all([
            // Since there's no dedicated endpoint for Acquisition Officer, fallback to generic /dashboard/overview or national if district is null, but ideally project or district if assigned.
            fetchApi(user?.districtId ? `/dashboard/district/${user.districtId}` : '/dashboard/overview').catch(() => null),
            fetchApi('/parcels?page=1&limit=5').catch(() => ({ data: [] })),
            fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059').catch(() => null)
        ])
        .then(([statsData, parcelsData, mapResponse]) => {
            setStats(statsData || {});
            
            // Set Task List
            setParcels(Array.isArray(parcelsData) ? parcelsData : (parcelsData?.data || parcelsData?.parcels || []));
            
            // Set Map Data
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
            setError('Failed to load dashboard data.');
        })
        .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div className="loading">Loading Acquisition Officer Dashboard...</div>;
    if (error) return <div className="error">{error}</div>;

    const s = stats || {};

    // KPIs for Acquisition Officer
    const metrics = [
        { label: 'Pending Notifications', value: s?.pendingNotifications || 0, icon: Activity },
        { label: 'Hearings Scheduled', value: s?.hearingsScheduled || 0, icon: Users },
        { label: 'Awards Processed', value: s?.awardsProcessed || 0, icon: CheckCircle },
        { label: 'Projects Assigned', value: s?.totalProjects || 0, icon: FileText }
    ];

    return (
        <div className="dashboard-page slide-in" style={{ paddingBottom: '4rem' }}>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapIcon size={14} /> Acquisition Officer Command Center
                        </p>
                        <h1 className="page-title">{user?.name || 'Officer'} Overview</h1>
                    </div>
                    <Link to="/app/projects/new" className="primary-btn">
                        Create New Project <ArrowRight size={16} />
                    </Link>
                </div>
            </header>

            {/* TOP KPI SECTION */}
            <div className="section-header" style={{ marginBottom: '1rem' }}>
                <h2>Key Performance Indicators</h2>
            </div>
            <div className="stats-grid mb-6">
                {metrics.map((m, idx) => (
                    <div key={idx} className="panel metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--surface-500)' }}>
                            <m.icon size={16} />
                            <p style={{ margin: 0 }}>{m.label}</p>
                        </div>
                        <h3 style={{ margin: 0 }}>{m.value}</h3>
                    </div>
                ))}
            </div>

            {/* PARCEL WORKSPACE (MAP) */}
            <div className="section-header" style={{ marginBottom: '1rem', marginTop: '3rem' }}>
                <h2>Parcel Workspace</h2>
                <p>Interactive spatial view of assigned parcels.</p>
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
                {/* TASK CENTER */}
                <div className="panel">
                    <div className="panel-header">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={16} /> Task Center (Assigned Parcels)</h2>
                    </div>
                    <div className="directory-table" style={{ marginTop: '1rem' }}>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem 0.5rem' }}>ULPIN</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>VILLAGE</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>OWNER</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>STATUS</th>
                                        <th style={{ padding: '1rem 0.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parcels.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No tasks assigned currently.</td>
                                        </tr>
                                    ) : (
                                        parcels.map(parcel => (
                                            <tr key={parcel.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontFamily: 'monospace' }}>
                                                    {parcel.ulpin || 'N/A'}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{parcel.village || 'N/A'}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{parcel.ownerName || 'N/A'}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span className="status status--progress">Action Required</span>
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                    <button onClick={() => navigate(`/app/parcels/${parcel.id}`)} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                        Process <ArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ALERTS & NOTIFICATIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="panel">
                        <div className="panel-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={16} /> Issue Tracking</h2>
                        </div>
                        <div className="empty-state mt-4">
                            <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> No critical issues detected</p>
                        </div>
                    </div>
                    
                    <div className="panel">
                        <div className="panel-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> Upcoming Deadlines</h2>
                        </div>
                        <div className="empty-state mt-4">
                            <p><AlertCircle size={14} style={{ display: 'inline', color: 'var(--alert-600)' }}/> No immediate deadlines</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
