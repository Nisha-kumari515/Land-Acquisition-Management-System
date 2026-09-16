import React, { useEffect, useRef } from 'react';
import './WorkflowSection.css';
import { FileEdit, Search, MapPin, BellRing, Trophy, Banknote, ShieldCheck, Home, CheckSquare } from 'lucide-react';

export default function WorkflowSection() {
    const sectionRef = useRef(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.3 });
        
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const steps = [
        { icon: <FileEdit size={22} />, title: 'Proposal', desc: 'Agency initiates land acquisition request' },
        { icon: <Search size={22} />, title: 'Scrutiny', desc: 'Initial verification of land records' },
        { icon: <MapPin size={22} />, title: 'Survey', desc: 'GIS-enabled field verification' },
        { icon: <BellRing size={22} />, title: 'Notification', desc: 'Statutory public declarations' },
        { icon: <Trophy size={22} />, title: 'Award', desc: 'Final declaration and impact assessment' },
        { icon: <Banknote size={22} />, title: 'Compensation', desc: 'Transparent automated disbursement' },
        { icon: <ShieldCheck size={22} />, title: 'Possession', desc: 'Legal handover of verified parcels' },
        { icon: <Home size={22} />, title: 'R&R', desc: 'Rehabilitation and resettlement tracking' },
        { icon: <CheckSquare size={22} />, title: 'Closure', desc: 'Final project completion and audit' },
    ];

    return (
        <section id="how-it-works" className="section bg-soft">
            <div className="section-wrapper fade-up">
                <span className="section-label" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem', color: 'var(--primary-teal)' }}>THE PROCESS</span>
                <h2 className="section-title" style={{ textAlign: 'center' }}>End-to-End Acquisition Lifecycle</h2>
                <p className="section-desc" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    A beautiful, standardized workflow from initial proposal to final possession and rehabilitation.
                </p>

                <div className="workflow-container" ref={sectionRef}>
                    {/* The animated horizontal track connecting the nodes */}
                    <div className="workflow-track">
                        <div className="workflow-track-fill"></div>
                    </div>
                    
                    <div className="workflow-steps-wrapper">
                        {steps.map((step, index) => (
                            <div className="workflow-step-node" key={index}>
                                <div className="workflow-icon-box">{step.icon}</div>
                                <div>
                                    <div className="workflow-step-title">{step.title}</div>
                                    <div className="workflow-step-desc">{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
