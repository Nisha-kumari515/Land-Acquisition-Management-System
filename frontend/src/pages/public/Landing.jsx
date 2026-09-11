import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map, Layers, ShieldCheck, ArrowRight, BarChart3, Database } from 'lucide-react';

export default function Landing() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-container header-content">
                    <div className="brand">
                        <Map className="brand-icon" />
                        <span className="brand-text">BHOOMISETU</span>
                    </div>
                    <nav className="landing-nav">
                        <a href="#about">About</a>
                        <a href="#capabilities">Capabilities</a>
                        <a href="#lifecycle">Acquisition Lifecycle</a>
                        <Link to="/login" className="quiet-btn" style={{ marginLeft: '1rem' }}>Sign In</Link>
                        <Link to="/login" className="primary-btn">Platform Login</Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="landing-container hero-grid">
                        <div className="hero-text animate-on-scroll" style={{ opacity: 0 }}>
                            <p className="eyebrow" style={{ color: 'var(--brand-200)' }}>Ministry of Rural Development</p>
                            <h1 className="hero-title">ONE PARCEL.<br/>ONE DIGITAL STORY.<br/>ONE NATIONAL ACQUISITION VIEW.</h1>
                            <p className="hero-subtitle">
                                BHOOMISETU connects land records, cadastral GIS, acquisition workflows, compensation, R&R, and decision support into one comprehensive national platform.
                            </p>
                            <div className="hero-actions">
                                <a href="#capabilities" className="primary-btn">Explore Platform</a>
                                <Link to="/login" className="secondary-btn">Login to BHOOMISETU <ArrowRight size={18}/></Link>
                            </div>
                        </div>
                        <div className="hero-visual animate-on-scroll" style={{ opacity: 0, animationDelay: '0.2s' }}>
                            <div className="gis-mockup">
                                <div className="gis-mockup-header">
                                    <span className="dot" style={{ background: 'var(--alert-500)'}}></span>
                                    <span className="dot" style={{ background: 'var(--warn-500)'}}></span>
                                    <span className="dot" style={{ background: 'var(--success-500)'}}></span>
                                </div>
                                <div className="gis-mockup-body">
                                    <div className="mock-map">
                                        <div className="mock-corridor"></div>
                                        <div className="mock-parcel active"></div>
                                        <div className="mock-parcel"></div>
                                        <div className="mock-parcel alert"></div>
                                    </div>
                                    <div className="mock-panel">
                                        <div className="skeleton-text short"></div>
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-text long"></div>
                                        <div className="mock-stats">
                                            <div className="mock-stat-box"></div>
                                            <div className="mock-stat-box"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="problem-section landing-container animate-on-scroll" style={{ opacity: 0 }}>
                    <div className="section-header text-center">
                        <h2>The Challenge & The Bridge</h2>
                        <p>Fragmented systems lead to manual coordination, delayed decisions, and limited visibility.</p>
                    </div>
                    <div className="solution-flow">
                        <div className="problem-box">Fragmented Systems</div>
                        <ArrowRight className="flow-arrow" />
                        <div className="problem-box">Manual Coordination</div>
                        <ArrowRight className="flow-arrow" />
                        <div className="problem-box">Delayed Decisions</div>
                        
                        <div className="bhoomisetu-bridge">
                            <h3 style={{color: 'white', marginBottom: '1rem'}}>BHOOMISETU</h3>
                            <div className="bridge-features">
                                <span>Unified Intelligence</span>
                                <span>GIS Impact Analysis</span>
                                <span>End-to-End Workflow</span>
                                <span>Explainable Risk</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="capabilities" className="capabilities-section bg-surface-50">
                    <div className="landing-container animate-on-scroll" style={{ opacity: 0 }}>
                        <div className="section-header">
                            <h2>Core Capabilities</h2>
                        </div>
                        <div className="capabilities-grid">
                            <div className="capability-card">
                                <Layers className="cap-icon" />
                                <h3>Unified Parcel Intelligence</h3>
                                <p>Aggregate identity, ownership, and geographic data into a single unified profile.</p>
                            </div>
                            <div className="capability-card">
                                <Map className="cap-icon" />
                                <h3>GIS Impact Analysis</h3>
                                <p>Overlay infrastructure alignments directly onto cadastral maps to instantly identify affected parcels.</p>
                            </div>
                            <div className="capability-card">
                                <BarChart3 className="cap-icon" />
                                <h3>National Dashboards</h3>
                                <p>Real-time analytics and KPI tracking for national, state, and district authorities.</p>
                            </div>
                            <div className="capability-card">
                                <Database className="cap-icon" />
                                <h3>Interoperability</h3>
                                <p>Standardized adapters for State Land Records (e.g., Assam BhuNaksha) to normalize data nationwide.</p>
                            </div>
                            <div className="capability-card">
                                <ShieldCheck className="cap-icon" />
                                <h3>Auditability & Trust</h3>
                                <p>Strict Role-Based Access Control and immutable audit trails for every workflow mutation.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="lifecycle" className="lifecycle-section landing-container animate-on-scroll" style={{ opacity: 0 }}>
                    <div className="section-header text-center">
                        <h2>End-to-End Acquisition Lifecycle</h2>
                    </div>
                    <div className="lifecycle-timeline">
                        {['Proposal', 'Scrutiny', 'Survey', 'Notification', 'Award', 'Compensation', 'Possession', 'R&R'].map((step, idx) => (
                            <div className="timeline-step" key={step}>
                                <div className="step-circle">{idx + 1}</div>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-container footer-grid">
                    <div>
                        <div className="brand" style={{ color: 'white', marginBottom: '1rem'}}>
                            <Map className="brand-icon" />
                            <span className="brand-text">BHOOMISETU</span>
                        </div>
                        <p style={{ color: 'var(--surface-400)', fontSize: '0.875rem' }}>National Land Acquisition & Management System</p>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1rem'}}>Capabilities</h4>
                        <ul className="footer-links">
                            <li>GIS Analysis</li>
                            <li>Compensation</li>
                            <li>Risk Engine</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1rem'}}>Stakeholders</h4>
                        <ul className="footer-links">
                            <li>National Authority</li>
                            <li>State Nodal Agency</li>
                            <li>District Collectors</li>
                            <li>Field Officers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1rem'}}>Legal</h4>
                        <ul className="footer-links">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Security Compliance</li>
                        </ul>
                    </div>
                </div>
                <div className="landing-container" style={{ borderTop: '1px solid var(--surface-700)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                    © {new Date().getFullYear()} Ministry of Rural Development. Demo Prototype.
                </div>
            </footer>
        </div>
    );
}
