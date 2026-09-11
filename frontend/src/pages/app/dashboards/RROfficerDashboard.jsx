import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { Users, AlertTriangle, CheckCircle, Clock, ArrowRight, Activity, Map as MapIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RROfficerDashboard() {
    const [families, setFamilies] = useState([]);
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchApi('/rr/families'),
            fetchApi('/risks?limit=10')
        ])
        .then(([famData, riskData]) => {
            setFamilies(Array.isArray(famData) ? famData : (famData?.data || []));
            setRisks(Array.isArray(riskData) ? riskData : (riskData?.data || []));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const totalFamilies = families.length;
    const eligibleFamilies = families.filter(f => f.eligible).length;
    const pendingFamilies = families.filter(f => f.status === 'PENDING').length;
    const completedFamilies = families.filter(f => f.status === 'COMPLETED').length;

    const metrics = [
        { label: 'Affected Families', value: totalFamilies, icon: Users },
        { label: 'Eligible for R&R', value: eligibleFamilies, icon: CheckCircle },
        { label: 'Pending Cases', value: pendingFamilies, icon: Clock },
        { label: 'Settled Cases', value: completedFamilies, icon: Activity }
    ];

    const workflowStates = [...new Set(families.map(f => f.status))].filter(Boolean);

    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <p className="eyebrow">R&R Officer</p>
                        <h1 className="page-title">Rehabilitation & Resettlement</h1>
                    </div>
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
                    <h2>Statutory Workflow States</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {workflowStates.length === 0 ? (
                        <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>No workflow states found yet.</p>
                    ) : (
                        workflowStates.map((state, idx) => (
                            <React.Fragment key={state}>
                                <div style={{ padding: '0.5rem 1rem', background: 'var(--surface-100)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500 }}>
                                    {state}
                                </div>
                                {idx < workflowStates.length - 1 && <ChevronRight size={16} color="var(--surface-400)" />}
                            </React.Fragment>
                        ))
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="panel" style={{ flex: 1 }}>
                    <div className="panel-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Family / Case Table</h2>
                        <Link to="/app/rr" className="secondary-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    
                    {loading ? (
                        <div className="loading">Loading cases...</div>
                    ) : (
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem 0.5rem' }}>Reference</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Members</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Eligibility</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {families.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--surface-500)' }}>No R&R cases found.</td>
                                        </tr>
                                    ) : (
                                        families.slice(0, 10).map(family => (
                                            <tr key={family.id} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>
                                                    {family.familyReference}
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{family.membersCount}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span className={`status ${family.eligible ? 'status--success' : 'status--error'}`}>
                                                        {family.eligible ? 'Eligible' : 'Not Eligible'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <span className="status" style={{ background: 'var(--surface-100)' }}>
                                                        {family.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '6px', background: 'var(--surface-200)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${family.resettlementProgress || 0}%`, height: '100%', background: 'var(--primary-600)' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--surface-500)' }}>{family.resettlementProgress || 0}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="panel">
                        <div className="panel-header" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapIcon size={18} /> Affected Areas Map</h2>
                        </div>
                        <div style={{ background: 'var(--surface-100)', height: '150px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                            Interactive Map View<br/>(Integration Pending)
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={18} /> Risk Alerts</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {loading ? (
                                <div className="loading" style={{ fontSize: '0.875rem' }}>Loading alerts...</div>
                            ) : risks.length === 0 ? (
                                <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>No pending alerts.</p>
                            ) : (
                                risks.filter(r => r.level === 'HIGH' || r.level === 'MEDIUM').slice(0, 3).map(risk => (
                                    <div key={risk.id} style={{ 
                                        padding: '0.75rem', 
                                        background: risk.level === 'HIGH' ? 'var(--error-50)' : 'var(--warning-50)', 
                                        borderLeft: `3px solid ${risk.level === 'HIGH' ? 'var(--error-500)' : 'var(--warning-500)'}`, 
                                        borderRadius: '4px' 
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: risk.level === 'HIGH' ? 'var(--error-700)' : 'var(--warning-700)' }}>
                                            {Array.isArray(risk.reasons) && risk.reasons.length > 0 ? risk.reasons[0] : 'Risk Alert'}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: risk.level === 'HIGH' ? 'var(--error-600)' : 'var(--warning-600)' }}>
                                            Score: {risk.score} | Action: {risk.recommendedAction || 'Review required'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
