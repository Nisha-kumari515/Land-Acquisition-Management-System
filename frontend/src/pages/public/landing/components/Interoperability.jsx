import React from 'react';
import { ArrowDown, Database, Network } from 'lucide-react';

export default function Interoperability() {
    return (
        <section className="section bg-blue-soft text-center">
            <div className="section-wrapper fade-up">
                <span className="section-label">System Architecture</span>
                <h2 className="section-title">Connect existing systems. Do not replace them.</h2>
                <p className="section-desc">BHOOMISETU acts as an integration layer between disparate state and national government systems.</p>

                <div className="arch-diagram fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="arch-pill-group" style={{ gap: '0.75rem' }}>
                        <span className="arch-pill"><Database size={14} style={{display:'inline', marginRight:4}}/> Dharitree</span>
                        <span className="arch-pill"><Database size={14} style={{display:'inline', marginRight:4}}/> BhuNaksha</span>
                        <span className="arch-pill"><Database size={14} style={{display:'inline', marginRight:4}}/> State Land Records</span>
                        <span className="arch-pill"><Database size={14} style={{display:'inline', marginRight:4}}/> Treasury Systems</span>
                    </div>
                    
                    <div className="visual-flow-arrow"><ArrowDown size={24} /></div>
                    
                    <div className="arch-box" style={{ width: '100%', maxWidth: '600px', borderStyle: 'dashed', backgroundColor: 'transparent', borderColor: 'var(--primary-navy)' }}>
                        <Network size={20} color="var(--primary-navy)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ color: 'var(--primary-navy)' }}>STATE ADAPTER LAYER</div>
                    </div>
                    
                    <div className="visual-flow-arrow"><ArrowDown size={24} /></div>
                    
                    <div className="arch-box" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--surface)' }}>
                        <div style={{ color: 'var(--primary-teal)' }}>CANONICAL DATA MODEL</div>
                    </div>
                    
                    <div className="visual-flow-arrow"><ArrowDown size={24} /></div>
                    
                    <div className="arch-box arch-box-core" style={{ width: '100%', maxWidth: '600px' }}>
                        BHOOMISETU NATIONAL VIEW
                    </div>
                </div>
            </div>
        </section>
    );
}
