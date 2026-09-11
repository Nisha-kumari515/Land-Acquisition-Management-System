import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Activity, IndianRupee, Users, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GenericRoleDashboard({ roleName }) {
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch some real parcels to populate the "task list" for this role
        fetchApi('/parcels?page=1&limit=5')
            .then(data => {
                setParcels(Array.isArray(data) ? data : (data.data || data.parcels || []));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getRoleMetrics = () => {
        switch (roleName) {
            case 'Acquisition Officer': return [
                { label: 'Pending Notifications', value: '14', icon: Activity },
                { label: 'Hearings Scheduled', value: '3', icon: Users },
                { label: 'Awards Processed', value: '45', icon: CheckCircle }
            ];
            case 'Finance Officer': return [
                { label: 'Pending Disbursals', value: '₹ 4.2 Cr', icon: IndianRupee },
                { label: 'Approved Compensation', value: '28', icon: CheckCircle },
                { label: 'Audit Flags', value: '2', icon: Activity }
            ];
            case 'R&R Officer': return [
                { label: 'Families Affected', value: '124', icon: Users },
                { label: 'Rehabilitation Plans', value: '12', icon: FileText },
                { label: 'Settled Cases', value: '89', icon: CheckCircle }
            ];
            case 'Field Officer': return [
                { label: 'Pending Surveys', value: '18', icon: Activity },
                { label: 'Completed Inspections', value: '42', icon: CheckCircle },
                { label: 'Disputes Logged', value: '4', icon: FileText }
            ];
            default: return [
                { label: 'Active Tasks', value: '10', icon: Activity },
                { label: 'Completed', value: '45', icon: CheckCircle }
            ];
        }
    };

    const metrics = getRoleMetrics();

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <p className="eyebrow">{roleName}</p>
                        <h1 className="page-title">Operations Center</h1>
                    </div>
                    {roleName === 'Acquisition Officer' && (
                        <Link to="/app/projects/new" className="primary-btn">
                            Create New Project <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </header>

            <div className="stats-grid mt-6">
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

            <div className="panel mt-6">
                <div className="panel-header" style={{ marginBottom: '1rem' }}>
                    <h2>Recent Assigned Parcels (Tasks)</h2>
                </div>
                
                {loading ? (
                    <div className="loading">Loading assignments...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>ULPIN</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>VILLAGE</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>OWNER</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>ACTION REQUIRED</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcels.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No tasks assigned.</td>
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
                                                <Link to={`/app/parcels/${parcel.id}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    Process <ArrowRight size={14} />
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
