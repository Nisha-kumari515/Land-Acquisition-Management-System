import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { IndianRupee, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Compensation() {
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetchApi('/parcels?page=1&limit=50');
            setParcels(Array.isArray(response) ? response : (response.data || response.parcels || []));
        } catch (err) {
            setError(err.message || 'Failed to load compensation data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <h1 className="page-title">Compensation & R&R Engine</h1>
                <p className="page-subtitle">Calculate and track award disbursements according to First Schedule.</p>
            </header>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Total Approved Funds</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹ 0.00 Cr</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Pending Calculation</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-600)' }}>{parcels.length} Parcels</div>
                    </div>
                    <div className="stat-card" style={{ flex: 1, padding: '1rem', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                        <div style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>Disbursed</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>₹ 0.00</div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading calculation engine...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>DAG NO</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Owner</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Base Value (Est)</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Multipliers</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcels.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No pending compensations found.</td>
                                    </tr>
                                ) : (
                                    parcels.map(parcel => (
                                        <tr key={parcel.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{parcel.dagNo || 'N/A'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{parcel.ownerName || 'N/A'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>Pending</td>
                                            <td style={{ padding: '1rem 0.5rem', color: 'var(--surface-500)', fontSize: '0.875rem' }}>Solatium + Factor 1.5</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className="status status--pending">Calculation Pending</span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <button className="primary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <IndianRupee size={12} /> Calculate
                                                </button>
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
