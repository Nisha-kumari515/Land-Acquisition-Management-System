import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, ShieldCheck, Database, Layers, BarChart3, Users, Network, Activity } from 'lucide-react';
import '../../Landing.css';

export default function Landing() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div>
            {/* Navbar */}
            <header className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem' }}>
                    <Map size={24} color={scrolled ? 'var(--bhoomi-royal)' : 'white'} />
                    <span>BHOOMISETU</span>
                </div>
                <nav className="landing-nav-links">
                    <a href="#platform">Platform</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#gis">GIS</a>
                    <a href="#capabilities">Capabilities</a>
                    <a href="#stakeholders">Stakeholders</a>
                </nav>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ color: scrolled ? 'var(--bhoomi-navy)' : 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Login</Link>
                    <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>Explore Platform</Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-bg"></div>
                <div className="hero-overlay"></div>
                
                <div className="hero-content fade-up">
                    <div className="hero-eyebrow">National Land Acquisition & Management Platform</div>
                    <h1 className="hero-title">ONE PARCEL.<br/>ONE DIGITAL STORY.<br/>ONE NATIONAL<br/>ACQUISITION VIEW.</h1>
                    <p className="hero-subtitle">
                        BHOOMISETU connects land records, cadastral GIS, acquisition workflows, compensation, rehabilitation & resettlement, and decision intelligence into one unified parcel-centric platform.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/login" className="btn-primary">Explore BHOOMISETU</Link>
                        <a href="#gis" className="btn-secondary">View GIS Experience</a>
                    </div>
                </div>

                {/* Floating GIS Card for visual effect */}
                <div className="gis-floating-card fade-up" style={{ animationDelay: '0.5s' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bhoomi-light-teal)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Project Impact</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Affected Parcels</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Impacted Area</span>
                        <span style={{ fontWeight: 600 }}>Project Scope</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--bhoomi-warning)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Risk Analysis Active</span>
                    </div>
                </div>
            </section>

            {/* Trust Strip */}
            <div className="trust-strip">
                <div className="trust-item"><Map size={18} /> GIS-ENABLED</div>
                <div className="trust-item"><Layers size={18} /> PARCEL-CENTRIC</div>
                <div className="trust-item"><Network size={18} /> END-TO-END WORKFLOW</div>
                <div className="trust-item"><Database size={18} /> API-DRIVEN</div>
                <div className="trust-item"><Users size={18} /> ROLE-BASED</div>
                <div className="trust-item"><ShieldCheck size={18} /> AUDITABLE</div>
            </div>

            {/* Problem Section */}
            <section id="platform" className="section section-alt">
                <div className="fade-up">
                    <h2 className="section-title">Land acquisition is a chain of decisions — not a single transaction.</h2>
                    <p className="section-desc">Fragmented systems lead to manual documentation, state-specific process delays, data duplication, and limited real-time visibility across the acquisition lifecycle.</p>
                </div>
                
                <div className="problem-grid fade-up">
                    <div className="problem-card">
                        <div style={{ color: 'var(--bhoomi-critical)', marginBottom: '1rem' }}><Layers size={32} /></div>
                        <h3>Fragmented Records</h3>
                        <p>Land records, cadastral maps, and project documents live in separate silos, making identity verification and ownership assessment slow and error-prone.</p>
                    </div>
                    <div className="problem-card">
                        <div style={{ color: 'var(--bhoomi-warning)', marginBottom: '1rem' }}><Activity size={32} /></div>
                        <h3>Approval Delays</h3>
                        <p>Without unified workflows, notifications, compensation awards, and R&R processing suffer from manual coordination and visibility gaps.</p>
                    </div>
                    <div className="problem-card">
                        <div style={{ color: 'var(--bhoomi-royal)', marginBottom: '1rem' }}><Map size={32} /></div>
                        <h3>Disconnected GIS</h3>
                        <p>Spatial analysis is often decoupled from the actual financial and statutory workflows, creating a disconnect between the map and the mandate.</p>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="section">
                <div className="feature-split fade-up">
                    <div className="feature-text">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--bhoomi-navy)', marginBottom: '1.5rem' }}>From fragmented records to one digital acquisition story.</h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--bhoomi-sec-text)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            BHOOMISETU bridges the gap by providing a canonical Parcel Model. We connect Land Records, GIS, Project Corridors, Acquisition Stages, Compensation, and Risk directly into a unified Decision Support engine.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500, color: 'var(--bhoomi-navy)' }}><ShieldCheck color="var(--bhoomi-success)" /> Single Source of Truth</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500, color: 'var(--bhoomi-navy)' }}><Network color="var(--bhoomi-royal)" /> API Integration Layer</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500, color: 'var(--bhoomi-navy)' }}><BarChart3 color="var(--bhoomi-gis-teal)" /> National Decision Support</li>
                        </ul>
                    </div>
                    <div className="feature-visual" style={{ background: 'var(--bhoomi-soft-bg)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '3rem' }}>
                        <div style={{ padding: '1rem 2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontWeight: 600, color: 'var(--bhoomi-sec-text)' }}>LAND RECORD + GIS + PROJECT</div>
                        <ArrowRight size={24} color="var(--bhoomi-royal)" style={{ transform: 'rotate(90deg)' }} />
                        <div style={{ padding: '1rem 2rem', background: 'var(--bhoomi-navy)', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '1.25rem', boxShadow: '0 10px 20px rgba(11,31,58,0.2)' }}>BHOOMISETU</div>
                        <ArrowRight size={24} color="var(--bhoomi-royal)" style={{ transform: 'rotate(90deg)' }} />
                        <div style={{ padding: '1rem 2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontWeight: 600, color: 'var(--bhoomi-success)' }}>DECISION SUPPORT</div>
                    </div>
                </div>
            </section>

            {/* How It Works (Timeline) */}
            <section id="how-it-works" className="section section-alt">
                <div className="fade-up">
                    <h2 className="section-title">End-to-End Acquisition Lifecycle</h2>
                    <p className="section-desc">A beautiful, standardized workflow from initial proposal to final possession and rehabilitation.</p>
                </div>
                
                <div className="timeline fade-up">
                    {[
                        { num: '01', title: 'PROJECT PROPOSAL' },
                        { num: '02', title: 'DIGITAL SCRUTINY' },
                        { num: '03', title: 'GIS IMPACT ANALYSIS' },
                        { num: '04', title: 'NOTIFICATION' },
                        { num: '05', title: 'AWARD' },
                        { num: '06', title: 'COMPENSATION' },
                        { num: '07', title: 'POSSESSION' },
                        { num: '08', title: 'R&R' }
                    ].map((step) => (
                        <div className="timeline-step" key={step.num}>
                            <div className="timeline-circle">{step.num}</div>
                            <span>{step.title}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* GIS Section */}
            <section id="gis" className="section">
                <div className="fade-up text-center" style={{ textAlign: 'center' }}>
                    <h2 className="section-title">See the land before you make the decision.</h2>
                    <p className="section-desc">BhoomiSetu National GIS Map Studio overlays infrastructure alignments directly onto cadastral boundaries to instantly identify affected parcels and spatial risks.</p>
                </div>
                <div className="fade-up" style={{ maxWidth: 1200, margin: '0 auto', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(11,31,58,0.15)', border: '1px solid var(--bhoomi-soft-bg)' }}>
                    <img src="/images/bhoomisetu_hero_gis.jpg" alt="GIS Product Visualization" style={{ width: '100%', display: 'block' }} />
                </div>
                <div className="text-center" style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/login" className="btn-primary">Explore GIS</Link>
                </div>
            </section>

            {/* Parcel Intelligence & Interoperability */}
            <section id="capabilities" className="section section-alt">
                <div className="feature-split reverse fade-up">
                    <div className="feature-text">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--bhoomi-navy)', marginBottom: '1.5rem' }}>One parcel. One complete story.</h2>
                        <p style={{ fontSize: '1.125rem', color: 'var(--bhoomi-sec-text)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            BHOOMISETU brings information from fragmented systems into one parcel-centric view. 
                            Connect existing Land Records, Cadastral Systems, and Financial Systems instead of replacing them.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--bhoomi-soft-bg)', fontWeight: 600, color: 'var(--bhoomi-navy)' }}>Identity & Ownership</div>
                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--bhoomi-soft-bg)', fontWeight: 600, color: 'var(--bhoomi-navy)' }}>GIS Impact</div>
                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--bhoomi-soft-bg)', fontWeight: 600, color: 'var(--bhoomi-navy)' }}>Compensation</div>
                            <div style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--bhoomi-soft-bg)', fontWeight: 600, color: 'var(--bhoomi-navy)' }}>R&R & Risk</div>
                        </div>
                    </div>
                    <div className="feature-visual" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ color: 'var(--bhoomi-royal)', marginBottom: '1rem' }}>Canonical Parcel Model</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'var(--bhoomi-soft-bg)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--bhoomi-sec-text)', borderLeft: '4px solid var(--bhoomi-gis-teal)' }}>State Land Records Integration</div>
                                <div style={{ padding: '1rem', background: 'var(--bhoomi-soft-bg)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--bhoomi-sec-text)', borderLeft: '4px solid var(--bhoomi-royal)' }}>Spatial Cadastral Geometry</div>
                                <div style={{ padding: '1rem', background: 'var(--bhoomi-soft-bg)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--bhoomi-sec-text)', borderLeft: '4px solid var(--bhoomi-success)' }}>Financial Disbursement API</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Role-Based / Stakeholders */}
            <section id="stakeholders" className="section">
                <div className="fade-up">
                    <h2 className="section-title">Role-Based Platform Architecture</h2>
                    <p className="section-desc">Designed for scalable national implementation with strict access controls.</p>
                </div>
                <div className="problem-grid fade-up" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    {[
                        'National Authority', 'State Government', 'District Authority', 
                        'Project Agency', 'Acquisition Officer', 'Finance Officer', 
                        'R&R Officer', 'Auditor'
                    ].map(role => (
                        <div key={role} style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--bhoomi-soft-bg)', borderRadius: '8px', textAlign: 'center', fontWeight: 600, color: 'var(--bhoomi-navy)', transition: 'all 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--bhoomi-royal)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--bhoomi-soft-bg)'}>
                            {role}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="section" style={{ background: 'var(--bhoomi-navy)', color: 'white', textAlign: 'center', padding: '8rem 4rem' }}>
                <div className="fade-up">
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>From land records to informed decisions.</h2>
                    <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
                        Bring every parcel, project milestone and acquisition decision into one connected view.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>Explore Platform</Link>
                        <Link to="/login" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>Login</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
                            <Map size={24} color="var(--bhoomi-gis-teal)" />
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
                        <h4>Stakeholders</h4>
                        <ul>
                            <li><a href="#national">National</a></li>
                            <li><a href="#state">State</a></li>
                            <li><a href="#district">District</a></li>
                            <li><a href="#agencies">Project Agencies</a></li>
                            <li><a href="#field">Field Officers</a></li>
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
                    <div>© {new Date().getFullYear()} BHOOMISETU</div>
                    <div>Smart India Hackathon 2026 Prototype</div>
                </div>
            </footer>
        </div>
    );
}
