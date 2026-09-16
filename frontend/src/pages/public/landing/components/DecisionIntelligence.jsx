import React from 'react';
import { AlertTriangle, Clock, Users, ShieldAlert, BarChart3, ShieldCheck, Home } from 'lucide-react';

export default function DecisionIntelligence() {
    return (
        <section className="section bg-white">
            <div className="section-wrapper fade-up">
                <span className="section-label">Decision Support</span>
                <h2 className="section-title">Know what needs attention before it becomes a delay.</h2>
                <p className="section-desc">Platform-wide risk detection tracks timeline delays, compensation backlogs, and data quality issues.</p>

                <div className="grid-6-cards fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="bhoomi-card">
                        <Clock size={24} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Timeline Risk</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Statutory milestone monitoring</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
                            Section 19 Deadline Approaching
                        </div>
                    </div>
                    
                    <div className="bhoomi-card">
                        <BarChart3 size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Compensation Backlog</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Assessment & disbursement pipeline</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--primary-navy)' }}>
                            Assessment → Approval → Disbursement
                        </div>
                    </div>

                    <div className="bhoomi-card">
                        <Users size={24} color="var(--primary-teal)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Ownership Complexity</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Title disputes and multi-share mapping</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Flags parcels with missing heir data
                        </div>
                    </div>
                    
                    <div className="bhoomi-card">
                        <ShieldAlert size={24} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Objection Status</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Section 15 hearing & litigation tracking</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>
                            Active Litigation / Court Stay
                        </div>
                    </div>
                    
                    <div className="bhoomi-card">
                        <Home size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">R&R Progress</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Affected family rehabilitation state</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
                            Entitlement Verification Complete
                        </div>
                    </div>
                    
                    <div className="bhoomi-card">
                        <ShieldCheck size={24} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Data Quality</h3>
                        <p className="gis-card-info" style={{ marginBottom: '1rem' }}>Record consistency and validation</p>
                        <div style={{ background: 'var(--bg-light)', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Spatial vs. Record Area Mismatch
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
