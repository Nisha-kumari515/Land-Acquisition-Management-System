import React from 'react';
import { Download, FileText, PieChart, BarChart } from 'lucide-react';

export default function Reports() {
    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <h1 className="page-title">National Reports & Analytics</h1>
                <p className="page-subtitle">Generate statutory compliance reports and MIS dashboards.</p>
            </header>

            <div className="panel mt-6">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Standard Compliance Reports</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    
                    <div className="stat-card" style={{ padding: '1.5rem', border: '1px solid var(--surface-200)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-600)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Section 11 Notification</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--surface-500)', marginBottom: '1rem' }}>Draft preliminary notification for publication.</p>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}><Download size={14} /> Generate PDF</button>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ padding: '1.5rem', border: '1px solid var(--surface-200)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-600)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>SIA Report</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--surface-500)', marginBottom: '1rem' }}>Social Impact Assessment summary document.</p>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}><Download size={14} /> Generate PDF</button>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ padding: '1.5rem', border: '1px solid var(--surface-200)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-600)' }}>
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Compensation MIS</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--surface-500)', marginBottom: '1rem' }}>Financial breakdown of land acquisition costs.</p>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}><Download size={14} /> Export CSV</button>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ padding: '1.5rem', border: '1px solid var(--surface-200)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-600)' }}>
                                <BarChart size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Project State Tracking</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--surface-500)', marginBottom: '1rem' }}>Status of all active national projects.</p>
                                <button className="secondary-btn" style={{ fontSize: '0.75rem' }}><Download size={14} /> Export Excel</button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
