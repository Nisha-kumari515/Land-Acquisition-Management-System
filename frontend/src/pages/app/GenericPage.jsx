import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { ServerCog, ArrowRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GenericPage({ title }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch projects to populate the generic lists
        fetchApi('/projects?page=1&limit=5')
            .then(data => {
                setRecords(Array.isArray(data) ? data : (data.data || data.projects || []));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--surface-500)', marginTop: '0.25rem' }}>Integrated module tracking active operations.</p>
                </div>
            </header>

            <div className="panel mt-6">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
                        <input type="text" placeholder={`Search ${title} records...`} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }} />
                    </div>
                    <button className="secondary-btn"><Filter size={16} /> Filters</button>
                </div>

                {loading ? (
                    <div className="loading">Syncing {title} data...</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>REFERENCE ID</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>DESCRIPTION</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>LAST UPDATED</th>
                                    <th style={{ padding: '1rem 0.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No active records found for {title}.</td>
                                    </tr>
                                ) : (
                                    records.map(record => (
                                        <tr key={record.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: '500', fontFamily: 'monospace' }}>
                                                {record.code || `REF-${record.id.slice(0,6)}`}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{record.name || 'Ongoing Operation'}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span className="status status--progress">In Progress</span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{new Date().toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <Link to={`/app/projects/${record.id}`} className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                                                    Manage <ArrowRight size={14} />
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
