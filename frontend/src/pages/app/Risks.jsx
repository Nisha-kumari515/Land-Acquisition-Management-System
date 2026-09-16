import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api/client';
import { Search, Filter, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Risks() {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRisks();
    }, []);

    const loadRisks = async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/risks');
            setRisks(Array.isArray(response) ? response : (response.data || response.risks || []));
        } catch (err) {
            setError(err.message || 'Failed to load risks');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Explainable Risk Engine</h1>
                    <p className="page-subtitle">AI-driven predictive risk assessment for land acquisition.</p>
                </div>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
                        <input type="text" placeholder="Search by Project or Parcel..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }} />
                    </div>
                    <button className="secondary-btn"><Filter size={16} /> Filters</button>
                </div>

                {loading ? (
                    <div className="loading">Analyzing risk vectors...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>PARCEL ULPIN</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>RISK LEVEL</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>PRIMARY FACTOR</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>LAST ASSESSED</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {risks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No high-risk parcels detected.</td>
                                    </tr>
                                ) : (
                                    risks.map(risk => (
                                        <tr key={risk.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontFamily: 'monospace' }}>
                                                {risk.ulpin || risk.parcelId || 'Unknown'}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className={`status status--${risk.riskLevel === 'HIGH' ? 'alert' : risk.riskLevel === 'MEDIUM' ? 'warning' : 'active'}`}>
                                                    {risk.riskLevel}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{risk.riskFactors ? JSON.stringify(risk.riskFactors).slice(0,30) + '...' : 'Litigation History'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{new Date().toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <Link to={`/app/parcels/${risk.parcelId}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    Resolve <ArrowRight size={14} />
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
