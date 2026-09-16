import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BhoomiLogo from '../../../../components/BhoomiLogo';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FooterSection({ title, links, isMobile }) {
    const [isOpen, setIsOpen] = useState(false);

    // On desktop, always show links. On mobile, toggle.
    if (!isMobile) {
        return (
            <div className="footer-col">
                <h4>{title}</h4>
                <ul>
                    {links.map((link, idx) => (
                        <li key={idx}><Link to={link.href}>{link.label}</Link></li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="footer-col" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h4 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    cursor: 'pointer', margin: 0, padding: '0.5rem 0', border: 'none' 
                }}
            >
                {title}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h4>
            {isOpen && (
                <ul style={{ marginTop: '1rem' }}>
                    {links.map((link, idx) => (
                        <li key={idx}><Link to={link.href}>{link.label}</Link></li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function Footer() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sections = [
        {
            title: 'Platform',
            links: [
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Capabilities', href: '#capabilities' },
                { label: 'Stakeholders', href: '#stakeholders' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { label: 'GIS Map Studio', href: '#gis' },
                { label: 'Documentation', href: '#' },
                { label: 'Support Center', href: '#' }
            ]
        },
        {
            title: 'Governance',
            links: [
                { label: 'Security Protocols', href: '#' },
                { label: 'Data Privacy', href: '#' },
                { label: 'Audit Guidelines', href: '#' }
            ]
        },
        {
            title: 'Connect',
            links: [
                { label: 'Platform Login', href: '/login' },
                { label: 'National Portal', href: '#' }
            ]
        }
    ];

    return (
        <footer className="landing-footer">
            <div className="section-wrapper" style={{ maxWidth: '100%', margin: '0 auto' }}>
                <div className="footer-grid">
                    <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ filter: 'brightness(0) invert(1)' }}>
                            <BhoomiLogo />
                        </div>
                        <p style={{ color: '#B7C5D2', fontSize: '13px', maxWidth: '280px', margin: '1rem 0 0 0', lineHeight: 1.6 }}>
                            Land to Progress. People to Possibilities. <br/><br/>
                            A unified national digital platform for transparent, efficient, and parcel-centric land acquisition.
                        </p>
                    </div>

                    {!isMobile ? (
                        <>
                            <FooterSection title="Platform" links={sections[0].links} isMobile={false} />
                            <FooterSection title="Resources" links={sections[1].links} isMobile={false} />
                            <div>
                                <FooterSection title="Governance" links={sections[2].links} isMobile={false} />
                                <div style={{ height: '2rem' }}></div>
                                <FooterSection title="Connect" links={sections[3].links} isMobile={false} />
                            </div>
                        </>
                    ) : (
                        <div style={{ marginTop: '2rem' }}>
                            {sections.map((sec, idx) => (
                                <FooterSection key={idx} title={sec.title} links={sec.links} isMobile={true} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="footer-bottom">
                    <div>© {new Date().getFullYear()} BHOOMISETU National Acquisition Platform.</div>
                    <div className="footer-links">
                        <Link to="#">Terms</Link>
                        <Link to="#">Privacy</Link>
                        <Link to="#">Accessibility</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
