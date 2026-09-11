import React from 'react';
import { Map, Target, Layers, Code, Users, ShieldCheck } from 'lucide-react';

export default function FeatureStrip() {
    return (
        <div style={{
            background: 'var(--surface)', borderBottom: '1px solid var(--border-color)',
            padding: '1.5rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1rem', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(20,33,61,0.02)'
        }} className="feature-strip-responsive">
            <style>{`
                .feature-strip-item { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 12px; font-weight: 700; color: var(--primary-navy); letter-spacing: 0.05em; text-transform: uppercase; }
                @media (max-width: 1024px) { .feature-strip-responsive { grid-template-columns: repeat(3, 1fr) !important; padding: 1.5rem 2rem !important; gap: 1.5rem !important; } }
                @media (max-width: 768px) { .feature-strip-responsive { grid-template-columns: repeat(2, 1fr) !important; padding: 1.5rem !important; } .feature-strip-item { justify-content: flex-start; } }
            `}</style>
            <div className="feature-strip-item"><Map size={18} color="var(--primary-teal)" /> GIS ENABLED</div>
            <div className="feature-strip-item"><Target size={18} color="var(--primary-teal)" /> PARCEL CENTRIC</div>
            <div className="feature-strip-item"><Layers size={18} color="var(--primary-teal)" /> END-TO-END WORKFLOW</div>
            <div className="feature-strip-item"><Code size={18} color="var(--primary-teal)" /> API DRIVEN</div>
            <div className="feature-strip-item"><Users size={18} color="var(--primary-teal)" /> ROLE BASED</div>
            <div className="feature-strip-item"><ShieldCheck size={18} color="var(--primary-teal)" /> TRANSPARENT & AUDITABLE</div>
        </div>
    );
}
