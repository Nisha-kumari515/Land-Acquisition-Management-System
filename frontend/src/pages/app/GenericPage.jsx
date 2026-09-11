import React from 'react';
import { ServerCog } from 'lucide-react';

export default function GenericPage({ title }) {
    return (
        <div className="dashboard-page slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--surface-500)', marginTop: '0.25rem' }}>This module is connected to the BHOOMISETU digital platform.</p>
                </div>
            </header>
            <div className="panel mt-6" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state" style={{ border: 'none', background: 'transparent' }}>
                    <ServerCog size={48} style={{ color: 'var(--brand-300)', margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--surface-700)', marginBottom: '0.5rem' }}>{title} Subsystem Registered</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                        The frontend architecture for this module is securely integrated. 
                        Data operations are deferred to the authoritative backend APIs as per strict system requirements.
                    </p>
                </div>
            </div>
        </div>
    );
}
