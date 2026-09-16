import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../api/client';
import { projectApi } from '../../api/projects';
import { mapApi } from '../../api/map';
import MapContainer from '../../components/Map/MapContainer';
import { Search, Layers, X, Navigation, MousePointer2, Pencil, Trash2, Save, ChevronRight, AlertCircle, Filter } from 'lucide-react';

export default function NationalGISMapStudio() {
    const navigate = useNavigate();
    
    // Filters & Search
    const [stateFilter, setStateFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [villageFilter, setVillageFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Map State
    const [parcels, setParcels] = useState({ type: 'FeatureCollection', features: [] });
    const [projects, setProjects] = useState({ type: 'FeatureCollection', features: [] });
    const [affectedParcels, setAffectedParcels] = useState({ type: 'FeatureCollection', features: [] });
    
    // UI State
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnGeometry, setDrawnGeometry] = useState(null);
    const [showFilters, setShowFilters] = useState(true);
    
    // Loading & Errors
    const [loading, setLoading] = useState(true);
    const [impactLoading, setImpactLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadMapData();
    }, [stateFilter, districtFilter, villageFilter]);

    const loadMapData = async () => {
        setLoading(true);
        setError('');
        try {
            const queryParams = new URLSearchParams();
            if (stateFilter) queryParams.append('state', stateFilter);
            if (districtFilter) queryParams.append('district', districtFilter);
            if (villageFilter) queryParams.append('village', villageFilter);

            const [parcelsData, projectsData, affectedData] = await Promise.all([
                mapApi.getParcels(),
                mapApi.getProjects(),
                mapApi.getAffectedParcels()
            ]);
            
            if (parcelsData) setParcels(parcelsData);
            if (projectsData) setProjects(projectsData);
            if (affectedData) setAffectedParcels(affectedData);
        } catch (err) {
            console.error('Error loading map data:', err);
            setError('Failed to load actual GIS Map data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrawingComplete = (geometry) => {
        setDrawnGeometry(geometry);
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
            const response = await projectApi.analyzeImpact('temp-national-project', drawnGeometry);
            if (response && response.affectedParcels) {
                setAffectedParcels(response.affectedParcels);
            }
        } catch (e) {
            console.error(e);
            alert('Impact analysis failed');
        } finally {
            setImpactLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <header style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid var(--surface-200)', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: 'var(--brand-600)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>NATIONAL SPATIAL COMMAND</div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--surface-900)' }}>BHOOMISETU Master GIS View</h1>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className={`secondary-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                            <Filter size={16} /> Filters
                        </button>
                        <div className="search-bar" style={{ width: '300px', display: 'flex', alignItems: 'center', background: 'var(--surface-50)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)' }}>
                            <Search size={16} color="var(--surface-400)" />
                            <input 
                                type="text" 
                                placeholder="Search globally (ULPIN, Village)..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.875rem' }}
                            />
                        </div>
                        <button className="secondary-btn" onClick={() => { setIsDrawing(false); setDrawnGeometry(null); }}>
                            <MousePointer2 size={16} /> Select
                        </button>
                        <button className={`secondary-btn ${isDrawing ? 'active' : ''}`} onClick={() => { setIsDrawing(true); setSelectedParcel(null); }}>
                            <Pencil size={16} /> Draw Corridor
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
                
                {showFilters && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'var(--surface-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--surface-600)', marginBottom: '0.25rem' }}>State</label>
                            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="form-input">
                                <option value="">All States</option>
                                <option value="18">Assam</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--surface-600)', marginBottom: '0.25rem' }}>District</label>
                            <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="form-input">
                                <option value="">All Districts</option>
                                <option value="16">Kamrup (M)</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--surface-600)', marginBottom: '0.25rem' }}>Village</label>
                            <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)} className="form-input">
                                <option value="">All Villages</option>
                                <option value="16111059">Nongpoh</option>
                            </select>
                        </div>
                    </div>
                )}
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
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>DAG No</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.dagNo || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Patta No</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.pattaNo || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Area</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.area ? `${selectedParcel.area} sq.m` : 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Village</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedParcel.village || 'N/A'}</span>
                                </div>
                                {selectedParcel.riskLevel && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.75rem' }}>Risk Level</span>
                                        <span className={`status status--${selectedParcel.riskLevel === 'HIGH' ? 'alert' : 'active'}`}>{selectedParcel.riskLevel}</span>
                                    </div>
                                )}
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
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <MapContainer 
                            parcels={parcels} 
                            projects={projects} 
                            affectedParcels={affectedParcels}
                            onParcelSelect={setSelectedParcel}
                            isDrawing={isDrawing}
                            onDrawingComplete={handleDrawingComplete}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
