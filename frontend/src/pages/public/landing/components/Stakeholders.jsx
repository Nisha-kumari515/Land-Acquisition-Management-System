import React from 'react';
import { Building2, Landmark, MapPin, Scale, Wallet, FileCheck, ClipboardList, Briefcase } from 'lucide-react';

export default function Stakeholders() {
    return (
        <section id="stakeholders" className="section bg-soft">
            <div className="section-wrapper fade-up">
                <span className="section-label">Stakeholders</span>
                <h2 className="section-title">Role-Based Platform Architecture</h2>
                <p className="section-desc">Designed for scalable national implementation with strict access controls.</p>

                <div className="grid-4-cards fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Landmark size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Central Ministry</h3>
                        <p className="gis-card-info">National dashboards and top-level policy monitoring.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Building2 size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">State Government</h3>
                        <p className="gis-card-info">State-wide acquisition progress and pipeline visibility.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <MapPin size={24} color="var(--primary-teal)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">District Admin</h3>
                        <p className="gis-card-info">Execution coordination across local departments.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Briefcase size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Requiring Body</h3>
                        <p className="gis-card-info">Proposal submission and cost estimate approvals.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Scale size={24} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Acquisition Authority</h3>
                        <p className="gis-card-info">Statutory notices and legal hearing workflows.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Wallet size={24} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Finance Officer</h3>
                        <p className="gis-card-info">Compensation assessment and disbursement.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <FileCheck size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">R&R Authority</h3>
                        <p className="gis-card-info">Rehabilitation entitlement and resettlement plans.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <ClipboardList size={24} color="var(--primary-teal)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Field Officer</h3>
                        <p className="gis-card-info">Mobile GIS survey and ground verification tasks.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
