import React from 'react';
import { Shield, Map, ScrollText, CheckCircle, FileKey, Lock } from 'lucide-react';

export default function Governance() {
    return (
        <section className="section bg-soft text-center">
            <div className="section-wrapper fade-up">
                <span className="section-label">Trust & Security</span>
                <h2 className="section-title">Government-grade governance.</h2>
                <p className="section-desc">Enterprise security protocols ensuring data integrity and strict access controls across all administrative levels.</p>

                <div className="grid-6-cards fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem', textAlign: 'left' }}>
                    <div className="bhoomi-card bhoomi-card-small">
                        <Lock size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Role-Based Access</h3>
                        <p className="gis-card-info">Strict RBAC ensuring stakeholders only view or modify authorized data.</p>
                    </div>
                    
                    <div className="bhoomi-card bhoomi-card-small">
                        <Map size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Geographic Access</h3>
                        <p className="gis-card-info">Permissions constrained automatically by state, district, or project boundaries.</p>
                    </div>
                    
                    <div className="bhoomi-card bhoomi-card-small">
                        <ScrollText size={24} color="var(--primary-teal)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Audit Trail</h3>
                        <p className="gis-card-info">Immutable logs of every read, write, and approval action taken in the system.</p>
                    </div>
                    
                    <div className="bhoomi-card bhoomi-card-small">
                        <FileKey size={24} color="var(--primary-navy)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Document Versioning</h3>
                        <p className="gis-card-info">Secure version history for all statutory notices and legal awards.</p>
                    </div>
                    
                    <div className="bhoomi-card bhoomi-card-small">
                        <CheckCircle size={24} color="var(--primary-teal)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Data Validation</h3>
                        <p className="gis-card-info">Automated pre-checks against canonical state records to prevent entry errors.</p>
                    </div>
                    
                    <div className="bhoomi-card bhoomi-card-small">
                        <Shield size={24} color="var(--bhoomi-success)" style={{ marginBottom: '1rem' }} />
                        <h3 className="gis-card-title">Secure Authentication</h3>
                        <p className="gis-card-info">Multi-factor authentication supporting standard government identity providers.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
