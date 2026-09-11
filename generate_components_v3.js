const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages/public/landing/components';

const components = {
  'Navbar.jsx': `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X, Search } from 'lucide-react';
import BhoomiLogo from '../../../../../components/BhoomiLogo';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
        <header className={\`landing-navbar \${scrolled ? 'scrolled' : ''}\`}>
            <div className="brand-section">
                <div className="brand-icon">
                    <BhoomiLogo size={32} />
                </div>
                <div className="brand-titles">
                    <span className="brand-name">BHOOMISETU</span>
                    <span className="brand-tagline">Land to Progress. People to Possibilities.</span>
                </div>
            </div>
            <nav className="landing-nav-links">
                <a href="#platform">Platform</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#gis">GIS</a>
                <a href="#capabilities">Capabilities</a>
                <a href="#stakeholders">Stakeholders</a>
                <a href="#about">About</a>
                <a href="#resources">Resources</a>
            </nav>
            <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Search size={20} color="var(--bhoomi-text-primary)" style={{ cursor: 'pointer' }} />
                <Link to="/login" className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>Login</Link>
                <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>Explore Platform <ArrowRight size={16} /></Link>
                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
        {mobileMenuOpen && (
            <div className="mobile-drawer" style={{ display: 'flex' }}>
                <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                <a href="#gis" onClick={() => setMobileMenuOpen(false)}>GIS</a>
                <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
                <a href="#stakeholders" onClick={() => setMobileMenuOpen(false)}>Stakeholders</a>
                <Link to="/login" className="btn-secondary" style={{ justifyContent: 'center' }}>Login</Link>
                <Link to="/login" className="btn-primary" style={{ justifyContent: 'center' }}>Explore Platform</Link>
            </div>
        )}
        </>
    );
}`,
  'Hero.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Map, Users, ShieldCheck, Database, Network, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="split-hero">
            <div className="hero-left">
                <div className="hero-content fade-up">
                    <div className="hero-eyebrow">NATIONAL LAND ACQUISITION & MANAGEMENT PLATFORM</div>
                    <h1 className="hero-title" style={{ color: 'var(--brand-blue-dark)' }}>
                        ONE PARCEL.<br/>
                        ONE DIGITAL STORY.<br/>
                        <span className="teal-text">ONE NATIONAL<br/>ACQUISITION VIEW.</span>
                    </h1>
                    <p className="hero-subtitle">
                        BHOOMISETU connects land records, cadastral GIS, acquisition workflows, compensation, rehabilitation & resettlement, and decision intelligence into one unified parcel-centric platform.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/login" className="btn-primary">Explore BHOOMISETU <ArrowRight size={20} /></Link>
                        <a href="#gis" className="btn-secondary">View GIS Experience</a>
                    </div>
                </div>
            </div>
            
            <div className="hero-right">
                <div className="hero-bg-split"></div>
                <div className="hero-gradient-overlay"></div>
                
                <div className="hero-gis-container">
                    <div className="gis-floating-card gis-card-project fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="gis-card-label">PROJECT CORRIDOR</div>
                        <div className="gis-card-title">Proposed Infrastructure</div>
                        <div className="gis-card-info">Project Geometry</div>
                    </div>

                    <div className="gis-floating-card gis-card-parcel fade-up" style={{ animationDelay: '0.4s' }}>
                        <div className="gis-card-label">AFFECTED PARCELS</div>
                        <div className="gis-card-title">Project Impact</div>
                        <div className="gis-card-info">Spatial Analysis</div>
                    </div>

                    <div className="gis-floating-card gis-card-impact fade-up" style={{ animationDelay: '0.6s' }}>
                        <div className="gis-card-label">SELECTED PARCEL</div>
                        <div className="gis-card-title">Parcel Intelligence</div>
                        <div className="gis-card-info">Land Record • GIS Impact</div>
                    </div>
                </div>

                <div className="hero-map-controls">
                    <div className="map-control-btn">+</div>
                    <div className="map-control-btn">-</div>
                    <div className="map-control-btn"><Layers size={16}/></div>
                    <div className="map-control-btn"><Map size={16}/></div>
                </div>
            </div>

            <div className="hero-capability-strip">
                <div className="hero-feature"><Map size={18} color="var(--brand-blue)" /> GIS ENABLED</div>
                <div className="hero-feature"><Layers size={18} color="var(--brand-blue)" /> PARCEL CENTRIC</div>
                <div className="hero-feature"><Network size={18} color="var(--brand-blue)" /> END-TO-END WORKFLOW</div>
                <div className="hero-feature"><Database size={18} color="var(--brand-blue)" /> API DRIVEN</div>
                <div className="hero-feature"><Users size={18} color="var(--brand-blue)" /> ROLE BASED</div>
                <div className="hero-feature"><ShieldCheck size={18} color="var(--brand-blue)" /> TRANSPARENT & AUDITABLE</div>
            </div>
        </section>
    );
}`,
  'Footer.jsx': `import React from 'react';
import BhoomiLogo from '../../../../../components/BhoomiLogo';

export default function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-grid">
                <div className="footer-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'white' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem', borderRadius: '6px' }}>
                            <BhoomiLogo size={24} color="#FFFFFF" />
                        </div>
                        <span>BHOOMISETU</span>
                    </div>
                    <p style={{ color: '#AEBECD', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '250px' }}>
                        One Parcel. One Digital Story. One National Acquisition View.
                    </p>
                </div>
                <div className="footer-col">
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="#overview">Overview</a></li>
                        <li><a href="#gis">GIS</a></li>
                        <li><a href="#capabilities">Parcel Intelligence</a></li>
                        <li><a href="#acquisition">Acquisition</a></li>
                        <li><a href="#compensation">Compensation</a></li>
                        <li><a href="#rr">R&R</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="#how">How It Works</a></li>
                        <li><a href="#docs">Documentation</a></li>
                        <li><a href="#reports">Reports</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h4>Governance</h4>
                    <ul>
                        <li><a href="#security">Security</a></li>
                        <li><a href="#audit">Auditability</a></li>
                        <li><a href="#data">Data Quality</a></li>
                        <li><a href="#interop">Interoperability</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <div>© 2026 BHOOMISETU. Smart India Hackathon 2026 Prototype.</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                    <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Accessibility</a>
                </div>
            </div>
        </footer>
    );
}`
};

for (const [filename, content] of Object.entries(components)) {
    fs.writeFileSync(path.join(dir, filename), content);
}
