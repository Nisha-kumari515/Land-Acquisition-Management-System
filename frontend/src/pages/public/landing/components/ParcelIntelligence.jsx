import React from 'react';
import { FileText, Users, MapPin, Scale, Banknote, ShieldAlert, FolderOpen, Activity, Compass } from 'lucide-react';

export default function ParcelIntelligence() {
    return (
        <section id="capabilities" className="section bg-white">
            <div className="section-wrapper fade-up">
                <span className="section-label">Canonical Record</span>
                <h2 className="section-title">One parcel. One complete story.</h2>
                <p className="section-desc">BHOOMISETU brings information from fragmented systems into one parcel-centric view.</p>
                
                <div className="parcel-profile fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="parcel-core bhoomi-card bhoomi-card-large" style={{ backgroundColor: 'var(--footer-bg)', color: 'white', borderColor: 'var(--footer-bg)' }}>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>DAG No. 402/B</h3>
                        <div style={{ fontSize: '12px', color: '#B7C5D2', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Canonical Parcel ID: BHM-KA-84-291</div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '12px', color: '#B7C5D2', marginBottom: '0.25rem' }}>Status</div>
                            <div style={{ display: 'inline-block', background: 'rgba(24,121,78,0.2)', color: '#4ADE80', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>ACQUIRED & POSSESSED</div>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '12px', color: '#B7C5D2', marginBottom: '0.25rem' }}>Total Area</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>2.4 Hectares</div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: '12px', color: '#B7C5D2', marginBottom: '0.25rem' }}>Acquisition Project</div>
                            <div style={{ fontSize: '16px', fontWeight: 500 }}>NH-44 Expansion Corridor</div>
                        </div>
                    </div>
                    
                    <div className="parcel-tabs">
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Compass size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Identity</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Location & Bounds</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FileText size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Land Record</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>RoR & Mutation</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Users size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Ownership</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Title Holders & Shares</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <MapPin size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>GIS Impact</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Affected Geometry</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Scale size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Acquisition</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Statutory Notices</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Banknote size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Compensation</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Awards & Disbursement</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Activity size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>R&R</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rehabilitation Progress</span></div>
                        </div>
                        <div className="bhoomi-card bhoomi-card-small" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <ShieldAlert size={24} color="var(--primary-navy)" />
                            <div><strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary-navy)' }}>Risk</strong><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Objections & Litigation</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
