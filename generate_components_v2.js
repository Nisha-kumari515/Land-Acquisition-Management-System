const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages/public/landing/components';

const components = {
  'Navbar.jsx': `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, Menu, X, Search } from 'lucide-react';

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
                <Map size={28} color="var(--bhoomi-navy)" />
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
                <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Login</Link>
                <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Explore Platform <ArrowRight size={16} /></Link>
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
import { Layers, Map, Users, ShieldCheck, BarChart3, ArrowRight, Network, Database } from 'lucide-react';

export default function Hero() {
    return (
        <section className="split-hero">
            <div className="hero-left bg-white">
                <div className="hero-content fade-up">
                    <div className="hero-eyebrow">NATIONAL LAND ACQUISITION & MANAGEMENT PLATFORM</div>
                    <h1 className="hero-title">
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
                <div className="hero-feature"><Map size={18} color="var(--bhoomi-teal-gis)" /> GIS ENABLED</div>
                <div className="hero-feature"><Layers size={18} color="var(--bhoomi-teal-gis)" /> PARCEL CENTRIC</div>
                <div className="hero-feature"><Network size={18} color="var(--bhoomi-teal-gis)" /> END-TO-END WORKFLOW</div>
                <div className="hero-feature"><Database size={18} color="var(--bhoomi-teal-gis)" /> API DRIVEN</div>
                <div className="hero-feature"><Users size={18} color="var(--bhoomi-teal-gis)" /> ROLE BASED</div>
                <div className="hero-feature"><ShieldCheck size={18} color="var(--bhoomi-teal-gis)" /> TRANSPARENT & AUDITABLE</div>
            </div>
        </section>
    );
}`,
  'ProblemSection.jsx': `import React from 'react';
import { Layers, Activity, Map, Database, Clock, EyeOff } from 'lucide-react';

export default function ProblemSection() {
    return (
        <section id="platform" className="section bg-soft">
            <div className="fade-up">
                <h2 className="section-title">Land acquisition is a chain of decisions — not a single transaction.</h2>
                <p className="section-desc">Fragmented systems lead to manual documentation, state-specific process delays, data duplication, and limited real-time visibility across the acquisition lifecycle.</p>
            </div>
            <div className="problem-grid fade-up">
                <div className="bhoomi-card">
                    <Layers size={28} color="var(--bhoomi-blue-primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Fragmented Systems</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>Land records and cadastral maps live in separate silos, making ownership assessment error-prone.</p>
                </div>
                <div className="bhoomi-card">
                    <Database size={28} color="var(--bhoomi-teal-accent)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Manual Documentation</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>Extensive paperwork slows down statutory notification and award generation processes.</p>
                </div>
                <div className="bhoomi-card">
                    <Activity size={28} color="var(--bhoomi-warning)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Data Duplication</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>Repetitive data entry across departments increases discrepancies in compensation calculations.</p>
                </div>
                <div className="bhoomi-card">
                    <Clock size={28} color="var(--bhoomi-critical)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Approval Delays</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>Lack of unified workflows causes significant bottlenecks in R&R processing and possession.</p>
                </div>
                <div className="bhoomi-card">
                    <Map size={28} color="var(--bhoomi-teal-gis)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Disconnected GIS</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>Spatial analysis is decoupled from financial workflows, separating the map from the mandate.</p>
                </div>
                <div className="bhoomi-card">
                    <EyeOff size={28} color="var(--bhoomi-blue-secondary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--bhoomi-navy)' }}>Limited Visibility</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--bhoomi-text-secondary)', lineHeight: 1.5 }}>No real-time tracking from national to village level makes auditing and governance difficult.</p>
                </div>
            </div>
        </section>
    );
}`,
  'SolutionSection.jsx': `import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

export default function SolutionSection() {
    return (
        <section className="section bg-white text-center">
            <div className="fade-up">
                <h2 className="section-title">From fragmented records to one connected acquisition story.</h2>
                <p className="section-desc">BHOOMISETU bridges the gap by providing a canonical Parcel Model. We connect systems directly into a unified Decision Support engine.</p>
            </div>
            
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div className="bhoomi-card" style={{ padding: '1rem 2rem', fontWeight: 600 }}>LAND RECORDS</div>
                    <div className="bhoomi-card" style={{ padding: '1rem 2rem', fontWeight: 600 }}>CADASTRAL GIS</div>
                    <div className="bhoomi-card" style={{ padding: '1rem 2rem', fontWeight: 600 }}>PROJECTS</div>
                    <div className="bhoomi-card" style={{ padding: '1rem 2rem', fontWeight: 600 }}>FINANCE</div>
                    <div className="bhoomi-card" style={{ padding: '1rem 2rem', fontWeight: 600 }}>R&R</div>
                </div>
                
                <ArrowDown size={24} color="var(--bhoomi-blue-primary)" />
                <div style={{ background: 'var(--bhoomi-bg-blue-soft)', border: '1px solid var(--bhoomi-blue-secondary)', color: 'var(--bhoomi-blue-primary)', padding: '0.5rem 2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>INTEGRATION LAYER</div>
                <ArrowDown size={24} color="var(--bhoomi-blue-primary)" />
                
                <div className="bhoomi-card" style={{ padding: '1.5rem 4rem', background: 'var(--bhoomi-blue-primary)', color: 'white', borderColor: 'var(--bhoomi-blue-primary)', fontSize: '1.5rem', fontWeight: 800 }}>
                    BHOOMISETU
                </div>
                
                <ArrowDown size={24} color="var(--bhoomi-blue-primary)" />
                <div style={{ background: 'var(--bhoomi-bg-teal-soft)', border: '1px solid var(--bhoomi-teal-gis)', color: 'var(--bhoomi-teal-gis)', padding: '0.5rem 2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>PARCEL INTELLIGENCE</div>
                <ArrowDown size={24} color="var(--bhoomi-blue-primary)" />
                
                <div className="bhoomi-card" style={{ padding: '1rem 3rem', borderColor: 'var(--bhoomi-success)', color: 'var(--bhoomi-success)', fontWeight: 700 }}>
                    DECISION SUPPORT
                </div>
            </div>
        </section>
    );
}`,
  'WorkflowSection.jsx': `import React from 'react';

export default function WorkflowSection() {
    const steps = [
        'PROPOSAL', 'SCRUTINY', 'GIS IMPACT', 'NOTIFICATION', 
        'AWARD', 'COMPENSATION', 'POSSESSION', 'R&R', 'MONITORING'
    ];

    return (
        <section id="how-it-works" className="section bg-soft">
            <div className="fade-up">
                <h2 className="section-title">End-to-End Acquisition Lifecycle</h2>
                <p className="section-desc">A beautiful, standardized workflow from initial proposal to final possession and rehabilitation.</p>
            </div>
            <div className="timeline fade-up">
                {steps.map((step, index) => (
                    <div className="timeline-step" key={step}>
                        <div className="timeline-circle">{String(index + 1).padStart(2, '0')}</div>
                        <span>{step}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}`,
  'GISShowcase.jsx': `import React from 'react';
import { Link } from 'react-router-dom';

export default function GISShowcase() {
    return (
        <section id="gis" className="section bg-blue-soft">
            <div className="fade-up">
                <h2 className="section-title">See the land before you make the decision.</h2>
                <p className="section-desc">BhoomiSetu National GIS Map Studio overlays infrastructure alignments directly onto cadastral boundaries to instantly identify affected parcels and spatial risks.</p>
            </div>
            <div className="fade-up bhoomi-card" style={{ maxWidth: 1200, margin: '0 auto', padding: '8px', overflow: 'hidden' }}>
                <div style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <img src="/images/bhoomisetu_hero_gis.jpg" alt="GIS Product Visualization" style={{ width: '100%', display: 'block' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '250px' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--bhoomi-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Parcel Intelligence</h4>
                        <div style={{ height: '8px', background: 'var(--bhoomi-border-light)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                        <div style={{ height: '8px', background: 'var(--bhoomi-border-light)', borderRadius: '4px', width: '70%', marginBottom: '1rem' }}></div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ height: '24px', flex: 1, background: 'var(--bhoomi-bg-blue-soft)', borderRadius: '4px' }}></div>
                            <div style={{ height: '24px', flex: 1, background: 'var(--bhoomi-bg-teal-soft)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center" style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link to="/login" className="btn-primary">Explore GIS Experience</Link>
            </div>
        </section>
    );
}`,
  'ParcelIntelligence.jsx': `import React from 'react';
import { ShieldCheck, FileText, Map, DollarSign, Users, AlertTriangle } from 'lucide-react';

export default function ParcelIntelligence() {
    return (
        <section id="capabilities" className="section bg-white">
            <div className="fade-up">
                <h2 className="section-title">One parcel. One complete story.</h2>
                <p className="section-desc">BHOOMISETU brings information from fragmented systems into one parcel-centric view.</p>
            </div>
            
            <div className="fade-up bhoomi-card" style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bhoomi-border)' }}>
                    <div style={{ width: 48, height: 48, background: 'var(--bhoomi-bg-blue-soft)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bhoomi-blue-primary)' }}>
                        <Map size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--bhoomi-navy)' }}>Universal Parcel Intelligence</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--bhoomi-text-secondary)' }}>Unified Canonical Parcel Model</p>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <ShieldCheck size={20} color="var(--bhoomi-blue-secondary)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Identity & Land Record</div>
                    </div>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <Map size={20} color="var(--bhoomi-teal-gis)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>GIS Impact & Geometry</div>
                    </div>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <FileText size={20} color="var(--bhoomi-text-secondary)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Acquisition Workflow</div>
                    </div>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <DollarSign size={20} color="var(--bhoomi-success)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Compensation Status</div>
                    </div>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <Users size={20} color="var(--bhoomi-warning)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>R&R Displacements</div>
                    </div>
                    <div className="bhoomi-card" style={{ padding: '1rem', boxShadow: 'none', background: 'var(--bhoomi-bg-primary)' }}>
                        <AlertTriangle size={20} color="var(--bhoomi-critical)" style={{ marginBottom: '0.5rem' }}/>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Risk Intelligence</div>
                    </div>
                </div>
            </div>
        </section>
    );
}`,
  'Stakeholders.jsx': `import React from 'react';
import { User } from 'lucide-react';

export default function Stakeholders() {
    const roles = [
        'National Authority', 'State Government', 'District Authority', 
        'Project Agency', 'Acquisition Officer', 'Finance Officer', 
        'R&R Officer', 'Field Officer'
    ];

    return (
        <section id="stakeholders" className="section bg-soft">
            <div className="fade-up">
                <h2 className="section-title">Role-Based Platform Architecture</h2>
                <p className="section-desc">Designed for scalable national implementation with strict access controls.</p>
            </div>
            <div className="stakeholder-grid fade-up">
                {roles.map(role => (
                    <div key={role} className="bhoomi-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ background: 'var(--bhoomi-bg-blue-soft)', padding: '0.5rem', borderRadius: '50%', color: 'var(--bhoomi-blue-primary)' }}>
                            <User size={20} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--bhoomi-navy)' }}>{role}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}`,
  'FinalCTA.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="section" style={{ background: 'var(--bhoomi-blue-primary)', color: 'white', textAlign: 'center' }}>
            <div className="fade-up">
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
                    FROM LAND RECORDS<br/>TO INFORMED DECISIONS.
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                    Bring every parcel, project milestone and acquisition decision into one connected view.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/login" className="btn-primary" style={{ background: 'var(--bhoomi-teal-accent)', borderColor: 'var(--bhoomi-teal-accent)' }}>Explore Platform <ArrowRight size={20} /></Link>
                    <Link to="/login" className="btn-secondary" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Login</Link>
                </div>
            </div>
        </section>
    );
}`,
  'Footer.jsx': `import React from 'react';
import { Map } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="landing-footer">
            <div className="footer-grid">
                <div className="footer-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
                        <Map size={24} color="var(--bhoomi-teal-accent)" />
                        <span>BHOOMISETU</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '250px' }}>
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

