import React from 'react';
import { Link } from 'react-router-dom';

export default function FinalCTA() {
    return (
        <section className="section" style={{ 
            background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--secondary-navy) 100%)', 
            color: 'white', 
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(circle at top right, rgba(0, 155, 154, 0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(0, 155, 154, 0.1) 0%, transparent 40%)',
                zIndex: 0
            }}></div>
            <div className="section-wrapper fade-up" style={{ position: 'relative', zIndex: 1, padding: '4rem 0' }}>
                <h2 className="section-title" style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Ready to transform land acquisition?
                </h2>
                <p className="section-desc" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                    BHOOMISETU brings land records, GIS, acquisition, compensation and R&R intelligence into one unified platform.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/login" className="btn-primary" style={{ 
                        background: 'white', 
                        color: 'var(--primary-navy)', 
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}>
                        Explore Platform
                    </Link>
                    <Link to="/login" className="btn-secondary" style={{ 
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        Platform Login
                    </Link>
                </div>
            </div>
        </section>
    );
}
