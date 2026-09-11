import React from 'react';
import { Map as MapIcon, Box, FileEdit, Target } from 'lucide-react';

export default function NationalScale() {
    return (
        <section className="section bg-white text-center">
            <div className="section-wrapper fade-up">
                <span className="section-label">National Implementation</span>
                <h2 className="section-title">Built for national scale.</h2>
                <p className="section-desc">Designed to support multi-state, multi-agency infrastructure corridors with a unified hierarchy.</p>

                <div className="arch-diagram fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="arch-box" style={{ width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--footer-bg)', color: 'white', borderColor: 'var(--footer-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><MapIcon size={24} color="var(--accent-teal)" /> <span>STATE</span></div>
                        <span style={{ fontSize: '12px', color: '#B7C5D2', fontWeight: 500 }}>State-level monitoring</span>
                    </div>
                    
                    <div className="arch-box" style={{ width: '100%', maxWidth: '450px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-navy)', color: 'white', borderColor: 'var(--secondary-navy)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Box size={20} /> <span>DISTRICT</span></div>
                        <span style={{ fontSize: '12px', color: '#EAF3FA', fontWeight: 500 }}>District-level coordination</span>
                    </div>
                    
                    <div className="arch-box" style={{ width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-soft-blue)', borderColor: 'var(--bg-soft-blue)', color: 'var(--primary-navy)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Target size={20} color="var(--primary-navy)" /> <span>PROJECT</span></div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Project-level execution</span>
                    </div>
                    
                    <div className="arch-box" style={{ width: '100%', maxWidth: '350px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface)', borderColor: 'var(--primary-teal)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary-teal)' }}><FileEdit size={20} /> <span>PARCEL</span></div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Parcel-level intelligence</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
