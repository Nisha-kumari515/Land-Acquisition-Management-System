import React from 'react';
import './SolutionSection.css';
import { ArrowDown, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SolutionSection() {
    return (
        <section className="section bg-white text-center">
            <div className="section-wrapper fade-up">
                <span className="section-label" style={{ color: 'var(--primary-teal)' }}>THE SOLUTION</span>
                <h2 className="section-title">From fragmented records to one parcel-centric view.</h2>
                <p className="section-desc" style={{ margin: '0 auto', maxWidth: '700px' }}>
                    BHOOMISETU bridges the gap by providing a canonical Parcel Model. We connect systems directly into a unified Decision Support engine.
                </p>
                
                <div className="solution-diagram-container fade-up" style={{ animationDelay: '0.2s' }}>
                    
                    <div className="solution-source-box">
                        Government Systems (State & National)
                    </div>
                    
                    <div className="solution-flow-lines">
                        <div className="solution-line-animate"></div>
                    </div>
                    
                    <div className="solution-adapter-layer">
                        Integration Layer / Adapters
                    </div>
                    
                    <div className="solution-flow-lines">
                        <div className="solution-line-animate"></div>
                    </div>
                    
                    <div className="solution-canonical">
                        Canonical Parcel Model
                    </div>
                    
                    <div className="solution-flow-lines">
                        <div className="solution-line-animate" style={{ animationDelay: '0.5s' }}></div>
                        <ArrowDown size={20} />
                    </div>
                    
                    <div className="solution-core">
                        BHOOMISETU
                    </div>
                    
                    <div className="solution-features">
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> GIS Maps</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> Land Records</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> Documents</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> Workflow</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> Compensation</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> R&R</div>
                        <div className="solution-feature-pill"><CheckCircle2 size={16} color="var(--primary-teal)"/> Risk Analysis</div>
                    </div>
                    
                    <div className="solution-flow-lines">
                        <div className="solution-line-animate" style={{ height: '30px' }}></div>
                        <ArrowDown size={20} />
                    </div>
                    
                    <div className="solution-outcome">
                        <ShieldCheck size={24} color="var(--primary-navy)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Unified Acquisition Intelligence
                    </div>
                </div>
            </div>
        </section>
    );
}
