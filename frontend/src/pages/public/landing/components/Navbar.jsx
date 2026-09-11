import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BhoomiLogo from '../../../../components/BhoomiLogo';
import { Search, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="brand-section">
                <div className="brand-icon">
                    <BhoomiLogo size={36} color="var(--primary-navy)" />
                </div>
                <div className="brand-titles">
                    <span className="brand-name">BHOOMISETU</span>
                    <span className="brand-tagline">Land to Progress. People to Possibilities.</span>
                </div>
            </div>

            <div className="landing-nav-links">
                <a href="#how-it-works">Platform</a>
                <a href="#gis">GIS</a>
                <a href="#capabilities">Capabilities</a>
                <a href="#stakeholders">Stakeholders</a>
                <a href="#resources">Resources</a>
            </div>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Search size={20} color="var(--primary-navy)" style={{ cursor: 'pointer' }} />
                <Link to="/login" style={{ textDecoration: 'none', color: 'var(--primary-navy)', fontWeight: 600 }}>Login</Link>
                <Link to="/login" className="btn-primary" style={{ height: '40px', padding: '0 1.25rem', fontSize: '14px' }}>Explore Platform &rarr;</Link>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {mobileMenuOpen && (
                <div className="mobile-drawer">
                    <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Platform</a>
                    <a href="#gis" onClick={() => setMobileMenuOpen(false)}>GIS</a>
                    <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
                    <a href="#stakeholders" onClick={() => setMobileMenuOpen(false)}>Stakeholders</a>
                    <Link to="/login" className="btn-primary" onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '1rem', justifyContent: 'center' }}>Login / Explore</Link>
                </div>
            )}
        </nav>
    );
}
