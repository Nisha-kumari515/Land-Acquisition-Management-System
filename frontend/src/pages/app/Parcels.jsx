import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Search, Filter, Map, ArrowRight, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AssamBhuNakshaLookup from './AssamBhuNakshaLookup';

export default function Parcels() {
    const navigate = useNavigate();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAssamLookup, setShowAssamLookup] = useState(false);

    useEffect(() => {
        loadParcels();
    }, []);

    const loadParcels = async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/parcels?page=1&limit=50');
            setParcels(response?.items || []);
        } catch (err) {
            setError(err.message || 'Failed to load parcels');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Parcel Intelligence</h1>
                    <p className="page-subtitle">National cadastral registry and acquisition tracking.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="secondary-btn" onClick={() => setShowAssamLookup(!showAssamLookup)}>
                        <Download size={16} /> Import from BhuNaksha
                    </button>
                    <button className="primary-btn" onClick={() => navigate('/app/gis')}>
                        <Map size={16} /> View on Map
                    </button>
                </div>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            {showAssamLookup && (
                <AssamBhuNakshaLookup onImported={loadParcels} />
            )}

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
                        <input type="text" placeholder="Search by ULPIN, DAG No, or Owner Name..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }} />
                    </div>
                    <button className="secondary-btn"><Filter size={16} /> Filters</button>
                </div>

                {loading ? (
                    <div className="loading">Loading parcels...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>ULPIN</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>DAG NO</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>VILLAGE</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>OWNER</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>AREA (Ha)</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcels.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No parcels found.</td>
                                    </tr>
                                ) : (
                                    parcels.map(parcel => (
                                        <tr key={parcel.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontFamily: 'monospace' }}>
                                                {parcel.ulpin || 'N/A'}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{parcel.dagNo || 'N/A'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{parcel.village || 'N/A'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{parcel.ownerName || 'N/A'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{parcel.area || '0.00'}</td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <Link to={`/app/parcels/${parcel.id}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    View <ArrowRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
