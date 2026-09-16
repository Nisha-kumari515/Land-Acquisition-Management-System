import React from 'react';
import './ProblemSection.css';
import { Layers, FileText, Copy, Clock, Map, EyeOff, AlertTriangle, Database, Activity } from 'lucide-react';

export default function ProblemSection() {
    return (
        <section className="section bg-soft" id="platform">
            <div className="section-wrapper fade-up">
                <span className="section-label" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem', color: 'var(--danger)' }}>THE CHALLENGE</span>
                <h2 className="section-title" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
                    Land acquisition is a chain of decisions — not a single transaction.
                </h2>
                <p className="section-desc" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                    Legacy workflows fragment critical data across disparate systems, causing timeline delays, compensation errors, and a lack of unified visibility.
                </p>
                
                {/* Visual Architecture Diagram */}
                <div className="problem-diagram-container fade-up" style={{ animationDelay: '0.1s' }}>
                    
                    {/* Source Nodes */}
                    <div className="problem-source-nodes">
                        <div className="problem-node">
                            <Database size={20} color="var(--primary-teal)" />
                            Land Records (RoR)
                        </div>
                        <div className="problem-node">
                            <FileText size={20} color="var(--primary-navy)" />
                            Legal & Statutory
                        </div>
                        <div className="problem-node">
                            <Map size={20} color="var(--success)" />
                            Cadastral GIS Maps
                        </div>
                    </div>

                    {/* Animated Flow Lines */}
                    <div className="problem-flow-lines">
                        <div className="flow-line-animate"></div>
                        <AlertTriangle size={24} />
                    </div>

                    {/* Bottleneck Box */}
                    <div className="problem-bottleneck">
                        <Activity size={28} />
                        MANUAL COORDINATION / FRAGMENTED SYSTEMS
                    </div>

                    {/* Outcomes */}
                    <div className="problem-outcomes">
                        <span>DELAYS</span> • <span>DUPLICATION</span> • <span>LIMITED VISIBILITY</span>
                    </div>
                </div>

                {/* Pain Point Cards */}
                <div className="grid-6-cards fade-up" style={{ animationDelay: '0.2s', marginTop: '4rem' }}>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(22, 58, 112, 0.05)' }}>
                            <Layers size={24} color="var(--primary-navy)" />
                        </div>
                        <h3 className="gis-card-title">Fragmented Systems</h3>
                        <p className="gis-card-info">Data is siloed across various state and national departments making consolidation impossible.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(217, 139, 0, 0.05)' }}>
                            <FileText size={24} color="var(--warning)" />
                        </div>
                        <h3 className="gis-card-title">Manual Documentation</h3>
                        <p className="gis-card-info">Reliance on physical files leads to loss of information and extremely slow processing times.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(0, 155, 154, 0.05)' }}>
                            <Copy size={24} color="var(--primary-teal)" />
                        </div>
                        <h3 className="gis-card-title">Data Duplication</h3>
                        <p className="gis-card-info">Identical records are maintained across multiple offices, leading to conflicting ground truth.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(214, 69, 69, 0.05)' }}>
                            <Clock size={24} color="var(--danger)" />
                        </div>
                        <h3 className="gis-card-title">Approval Delays</h3>
                        <p className="gis-card-info">Statutory workflows stall because authorities lack access to verified cross-department data.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(22, 58, 112, 0.05)' }}>
                            <Map size={24} color="var(--primary-navy)" />
                        </div>
                        <h3 className="gis-card-title">Disconnected GIS</h3>
                        <p className="gis-card-info">Project geometries are not overlaid on real-time cadastral maps, obscuring actual impact.</p>
                    </div>
                    <div className="bhoomi-card bhoomi-card-small">
                        <div className="bhoomi-card-icon-wrapper" style={{ background: 'rgba(82, 101, 129, 0.05)' }}>
                            <EyeOff size={24} color="var(--text-secondary)" />
                        </div>
                        <h3 className="gis-card-title">Zero Real-Time Visibility</h3>
                        <p className="gis-card-info">Stakeholders have zero insight into bottleneck locations or real-time project risks.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
