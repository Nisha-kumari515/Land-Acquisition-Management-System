import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import MapContainer from '../../components/Map/MapContainer';
import { Layers, MousePointer2, Pencil, Trash2, Save, X, Search, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NationalGISMapStudio() {
    const navigate = useNavigate();
    const [parcels, setParcels] = useState(null);
    const [projects, setProjects] = useState(null);
    const [affectedParcels, setAffectedParcels] = useState(null);
    const [riskParcels, setRiskParcels] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI State
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnGeometry, setDrawnGeometry] = useState(null);
    const [impactLoading, setImpactLoading] = useState(false);
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        state: '',
        district: '',
        project: '',
        stage: '',
        risk: ''
    });

    // Layer Manager State
    const [layersVisible, setLayersVisible] = useState({
        cadastral: true,
        project: true,
        affected: true,
        risk: true
    });

    useEffect(() => {
        loadMapData();
    }, [filters]); // Re-load when filters change

    const loadMapData = async () => {
        setLoading(true);
        setError('');
        try {
            // Build query params based on filters
            const queryParams = new URLSearchParams();
            if (filters.state) queryParams.append('state', filters.state);
            if (filters.district) queryParams.append('district', filters.district);
            // We use default Assam coords if no state/district is selected just to show something
            if (!filters.state && !filters.district) {
                queryParams.append('state', '18');
                queryParams.append('district', '16');
                queryParams.append('tehsil', '16111');
                queryParams.append('village', '16111059');
            }

            // Fetch the official Assam map data, gracefully handling missing endpoint
            let assamMapData = null;
            try {
                assamMapData = await fetchApi(`/integration/assam/map?${queryParams.toString()}`);
            } catch (apiErr) {
                console.warn("API Error, using fallback data", apiErr);
            }
            
            let features = [];
            let affectedFeats = [];
            let riskFeats = [];

            if (assamMapData && assamMapData.features) {
                features = assamMapData.features.map(f => {
                    const feature = {
                        type: 'Feature',
                        properties: { 
                            dagNo: f.properties?.dag_no, 
                            ulpin: f.properties?.ulpin || f.properties?.dag_no,
                            riskLevel: f.properties?.riskLevel || null,
                            acquisitionStage: f.properties?.acquisitionStage || null,
                            village: f.properties?.village || 'Unknown'
                        },
                        geometry: f.geometry
                    };

                    if (feature.properties.acquisitionStage) {
                        affectedFeats.push(feature);
                    }
                    if (feature.properties.riskLevel) {
                        riskFeats.push(feature);
                    }
                    
                    return feature;
                });
            }

            // Client side filter search by query
            if (searchQuery) {
                features = features.filter(f => 
                    f.properties.dagNo?.includes(searchQuery) || 
                    f.properties.ulpin?.includes(searchQuery)
                );
            }

            setParcels({ type: 'FeatureCollection', features: features });
            setProjects({ type: 'FeatureCollection', features: [] });
            setAffectedParcels({ type: 'FeatureCollection', features: affectedFeats });
            setRiskParcels({ type: 'FeatureCollection', features: riskFeats });
        } catch (err) {
            console.error(err);
            setError('Failed to load map data. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        loadMapData();
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
            await fetchApi(`/projects/temp-impact-analysis`, {
                method: 'POST',
                body: JSON.stringify({ geometry: drawnGeometry })
            });
        } catch (err) {
            console.error('Impact analysis failed', err);
            setTimeout(() => setImpactLoading(false), 1000);
        }
    };

    const toggleLayer = (layer) => {
        setLayersVisible(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    return (
        <div className="gis-page" style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>
            <header className="page-header" style={{ borderBottom: '1px solid var(--surface-200)', padding: '1rem 2rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p className="eyebrow" style={{ color: 'var(--surface-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>National GIS Workspace</p>
                        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Map Studio</h1>
                    </div>
                    
                    <div className="gis-toolbar" style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            className={`secondary-btn ${!isDrawing && !drawnGeometry ? 'active' : ''}`}
                            onClick={() => setIsDrawing(false)}
                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', background: (!isDrawing && !drawnGeometry) ? 'var(--surface-100)' : 'white', cursor: 'pointer' }}
                        >
                            <MousePointer2 size={16} /> Select
                        </button>
                        <button 
                            className={`secondary-btn ${isDrawing ? 'active' : ''}`}
                            onClick={() => { setIsDrawing(true); setSelectedParcel(null); }}
                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', background: isDrawing ? 'var(--surface-100)' : 'white', cursor: 'pointer' }}
                        >
                            <Pencil size={16} /> Draw Polygon
                        </button>
                        {drawnGeometry && (
                            <>
                                <button className="secondary-btn" onClick={clearDrawing} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', background: 'white', cursor: 'pointer', color: '#EF4444' }}>
                                    <Trash2 size={16} /> Clear
                                </button>
                                <button className="primary-btn" onClick={runImpactAnalysis} disabled={impactLoading} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.375rem', border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer', fontWeight: 500 }}>
                                    {impactLoading ? 'Analyzing...' : <><Save size={16} /> Run Impact Analysis</>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem', textAlign: 'center' }}>{error}</div>}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar */}
                <aside className="gis-sidebar" style={{ width: '320px', background: 'white', borderRight: '1px solid var(--surface-200)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
                    
                    {/* Search */}
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-100)' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search Dag No or ULPIN..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.25rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', fontSize: '0.875rem' }}
                                />
                            </div>
                            <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', background: '#3B82F6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Find</button>
                        </form>
                    </div>

                    {/* Filters */}
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-100)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--surface-700)' }}>
                            <Filter size={16} /> Filters
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <select 
                                value={filters.state} 
                                onChange={(e) => setFilters({...filters, state: e.target.value})}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', fontSize: '0.875rem' }}
                            >
                                <option value="">All States</option>
                                <option value="18">Assam</option>
                                <option value="9">Uttar Pradesh</option>
                            </select>
                            <select 
                                value={filters.district} 
                                onChange={(e) => setFilters({...filters, district: e.target.value})}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', fontSize: '0.875rem' }}
                            >
                                <option value="">All Districts</option>
                                <option value="16">Kamrup Metropolitan</option>
                            </select>
                            <select 
                                value={filters.stage} 
                                onChange={(e) => setFilters({...filters, stage: e.target.value})}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', fontSize: '0.875rem' }}
                            >
                                <option value="">All Stages</option>
                                <option value="NOTIFICATION_ISSUED">Notification Issued</option>
                                <option value="AWARD_DECLARED">Award Declared</option>
                            </select>
                            <select 
                                value={filters.risk} 
                                onChange={(e) => setFilters({...filters, risk: e.target.value})}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--surface-300)', fontSize: '0.875rem' }}
                            >
                                <option value="">All Risk Levels</option>
                                <option value="HIGH">High Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="LOW">Low Risk</option>
                            </select>
                        </div>
                    </div>

                    {/* Layer Manager */}
                    <div className="layer-list" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--surface-700)' }}>
                            <Layers size={16} /> Professional Layer Manager
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layersVisible.cadastral} onChange={() => toggleLayer('cadastral')} />
                                <span style={{ fontSize: '0.875rem' }}>Cadastral (Base)</span>
                                <div style={{ marginLeft: 'auto', width: '14px', height: '14px', border: '1px solid #9CA3AF', background: '#F3F4F6', borderRadius: '2px' }} />
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layersVisible.project} onChange={() => toggleLayer('project')} />
                                <span style={{ fontSize: '0.875rem' }}>Project Corridors</span>
                                <div style={{ marginLeft: 'auto', width: '14px', height: '14px', border: '2px dashed #3B82F6', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }} />
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layersVisible.affected} onChange={() => toggleLayer('affected')} />
                                <span style={{ fontSize: '0.875rem' }}>Affected Parcels</span>
                                <div style={{ marginLeft: 'auto', width: '14px', height: '14px', border: '1px solid #EF4444', background: 'rgba(239, 68, 68, 0.3)', borderRadius: '2px' }} />
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={layersVisible.risk} onChange={() => toggleLayer('risk')} />
                                <span style={{ fontSize: '0.875rem' }}>Risk Heatmap</span>
                                <div style={{ marginLeft: 'auto', width: '14px', height: '14px', border: '1px solid #F59E0B', background: 'rgba(245, 158, 11, 0.4)', borderRadius: '2px' }} />
                            </label>
                        </div>
                    </div>
                </aside>
                
                {/* Main Map Area */}
                <main style={{ flex: 1, position: 'relative' }}>
                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ padding: '1rem 2rem', background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600 }}>
                                Rendering Map Layers...
                            </div>
                        </div>
                    )}
                    
                    <MapContainer 
                        parcels={parcels} 
                        projects={projects} 
                        affectedParcels={affectedParcels}
                        riskParcels={riskParcels}
                        layersVisible={layersVisible}
                        onParcelSelect={setSelectedParcel}
                        isDrawing={isDrawing}
                        onDrawingComplete={handleDrawingComplete}
                    />

                    {/* Parcel Intelligence Popup */}
                    {selectedParcel && (
                        <div className="parcel-info-panel" style={{ 
                            position: 'absolute', 
                            bottom: '2rem', 
                            right: '2rem', 
                            width: '320px', 
                            background: 'white', 
                            borderRadius: '0.5rem', 
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
                            zIndex: 30,
                            overflow: 'hidden'
                        }}>
                            <div style={{ background: 'var(--surface-50)', padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--surface-800)' }}>Parcel Intelligence</h3>
                                <button onClick={() => setSelectedParcel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--surface-500)' }}><X size={18}/></button>
                            </div>
                            
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.8125rem' }}>ULPIN</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.ulpin || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.8125rem' }}>Dag No</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.dagNo || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.8125rem' }}>Village</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.village || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.8125rem' }}>Risk Level</span>
                                        {selectedParcel.riskLevel ? (
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: 600, 
                                                padding: '0.125rem 0.5rem', 
                                                borderRadius: '9999px',
                                                background: selectedParcel.riskLevel === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
                                                color: selectedParcel.riskLevel === 'HIGH' ? '#B91C1C' : '#B45309'
                                            }}>
                                                {selectedParcel.riskLevel}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>None</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.8125rem' }}>Acquisition Stage</span>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: selectedParcel.acquisitionStage ? '#3B82F6' : 'inherit' }}>
                                            {selectedParcel.acquisitionStage ? selectedParcel.acquisitionStage.replace('_', ' ') : 'Not Affected'}
                                        </span>
                                    </div>
                                </div>
                                
                                <button 
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        background: 'var(--surface-100)', 
                                        border: '1px solid var(--surface-300)', 
                                        borderRadius: '0.375rem', 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        color: 'var(--surface-800)'
                                    }}
                                    onClick={() => navigate(`/app/parcels/${selectedParcel.id || selectedParcel.dagNo || 1}`)}
                                >
                                    Open Parcel Profile <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
