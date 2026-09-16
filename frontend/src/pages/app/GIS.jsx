import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import MapContainer from '../../components/Map/MapContainer';
import { Layers, MousePointer2, Pencil, Trash2, Save, X, Search, ChevronRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function GIS() {
    const navigate = useNavigate();
    const [parcels, setParcels] = useState(null);
    const [projects, setProjects] = useState(null);
    const [affectedParcels, setAffectedParcels] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI State
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnGeometry, setDrawnGeometry] = useState(null);
    const [impactLoading, setImpactLoading] = useState(false);

    // Bounding box (Assam roughly)
    const BBOX = '89.5,24.0,96.0,28.0'; 

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch the official Assam map data
            const assamMapData = await fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059');
            
            // Format the raw Assam payload into a GeoJSON FeatureCollection
            let features = [];
            if (assamMapData && assamMapData.features) {
                features = assamMapData.features.map(f => ({
                    type: 'Feature',
                    properties: { dagNo: f.properties?.dag_no, ulpin: `AS-${f.properties?.dag_no}` },
                    geometry: f.geometry
                }));
            }

            const geojsonParcels = {
                type: 'FeatureCollection',
                features: features
            };

            setParcels(geojsonParcels);
            setProjects({ type: 'FeatureCollection', features: [] });
            setAffectedParcels({ type: 'FeatureCollection', features: [] });
        } catch (err) {
            console.error(err);
            setError('Failed to load actual Assam BhuNaksha data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrawingComplete = (geojson) => {
        setDrawnGeometry(geojson);
        setIsDrawing(false);
    };

    const clearDrawing = () => {
        setDrawnGeometry(null);
        setIsDrawing(false);
    };

    const runImpactAnalysis = async () => {
        if (!drawnGeometry) return;
        setImpactLoading(true);
        try {
            // Note: A real backend would save this project geometry first and then run analysis
            // We simulate saving and running the analysis via the mock API or an existing POST endpoint.
            // Since this is purely UI simulation for drawing -> impact:
            const response = await fetchApi(`/projects/temp-impact-analysis`, {
                method: 'POST',
                body: JSON.stringify({ geometry: drawnGeometry })
            });
            // Handle success
        } catch (err) {
            console.error('Impact analysis failed (endpoint may not exist)', err);
            // Simulate UI response anyway
            setTimeout(() => setImpactLoading(false), 1000);
        }
    };

    if (loading) return <div className="loading">Initializing GIS Engine...</div>;
    
    return (
        <div className="gis-page" style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
            <header className="page-header" style={{ borderBottom: '1px solid var(--surface-200)', padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="eyebrow">Spatial Analysis</p>
                        <h1 className="page-title" style={{ fontSize: '1.25rem' }}>BHOOMISETU GIS Command Center</h1>
                    </div>
                    
                    <div className="gis-toolbar" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            className={`secondary-btn ${!isDrawing && !drawnGeometry ? 'active' : ''}`}
                            onClick={() => setIsDrawing(false)}
                        >
                            <MousePointer2 size={16} /> Select
                        </button>
                        <button 
                            className={`secondary-btn ${isDrawing ? 'active' : ''}`}
                            onClick={() => { setIsDrawing(true); setSelectedParcel(null); }}
                        >
                            <Pencil size={16} /> Draw Project Corridor
                        </button>
                        {drawnGeometry && (
                            <>
                                <button className="secondary-btn" onClick={clearDrawing}>
                                    <Trash2 size={16} /> Clear
                                </button>
                                <button className="primary-btn" onClick={runImpactAnalysis} disabled={impactLoading}>
                                    {impactLoading ? 'Analyzing...' : <><Save size={16} /> Run Impact Analysis</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {error && <div className="error-banner m-4">{error}</div>}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside className="gis-sidebar" style={{ width: '300px', background: 'white', borderRight: '1px solid var(--surface-200)', display: 'flex', flexDirection: 'column' }}>
                    <div className="panel-header" style={{ padding: '1rem', borderBottom: '1px solid var(--surface-100)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={16} /> Map Layers
                        </h3>
                    </div>
                    
                    <div className="layer-list" style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
                        <label className="layer-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ fontSize: '0.875rem' }}>Cadastral Parcels / DAGs</span>
                            <div style={{ marginLeft: 'auto', width: '12px', height: '12px', border: '1px solid #9CA3AF', background: '#F3F4F6' }} />
                        </label>
                        <label className="layer-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ fontSize: '0.875rem' }}>Project Boundaries</span>
                            <div style={{ marginLeft: 'auto', width: '12px', height: '12px', border: '2px dashed #3B82F6', background: 'rgba(59, 130, 246, 0.2)' }} />
                        </label>
                        <label className="layer-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ fontSize: '0.875rem' }}>Affected Parcels</span>
                            <div style={{ marginLeft: 'auto', width: '12px', height: '12px', border: '1px solid #EF4444', background: 'rgba(239, 68, 68, 0.3)' }} />
                        </label>
                    </div>

                    {selectedParcel && (
                        <div className="parcel-info-panel" style={{ borderTop: '1px solid var(--surface-200)', padding: '1.5rem', background: 'var(--surface-50)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Parcel Intelligence</h3>
                                <button className="quiet-btn" onClick={() => setSelectedParcel(null)}><X size={16}/></button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>ULPIN</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.ulpin || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Village</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.village || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Risk Level</span>
                                    {selectedParcel.riskLevel ? (
                                        <span className={`status status--${selectedParcel.riskLevel === 'HIGH' ? 'alert' : 'active'}`}>{selectedParcel.riskLevel}</span>
                                    ) : (
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>None</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Acquisition Stage</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.acquisitionStage ? selectedParcel.acquisitionStage.replace('_', ' ') : 'Not Affected'}</span>
                                </div>
                            </div>
                            
                            <button 
                                className="primary-btn w-full" 
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={() => navigate(`/app/parcels/${selectedParcel.id}`)}
                            >
                                View Full Digital Story <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </aside>
                
                <main style={{ flex: 1, position: 'relative' }}>
                    <MapContainer 
                        parcels={parcels} 
                        projects={projects} 
                        affectedParcels={affectedParcels}
                        onParcelSelect={setSelectedParcel}
                        isDrawing={isDrawing}
                        onDrawingComplete={handleDrawingComplete}
                    />
                </main>
            </div>
        </div>
    );
}
