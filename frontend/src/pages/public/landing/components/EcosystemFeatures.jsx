import React from 'react';
import { Database, Map, Users, Activity, Network, BarChart3 } from 'lucide-react';

export default function EcosystemFeatures() {
    return (
        <section className="section" style={{ background: 'white', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ color: 'var(--bhoomi-sec-text)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>FROM FRAGMENTED SYSTEMS TO A CONNECTED NATION</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--bhoomi-navy)' }}>Building a Smarter, Fairer and Faster Land Acquisition Ecosystem</h2>
                <div style={{ width: '60px', height: '3px', background: 'var(--bhoomi-light-teal)', margin: '1rem auto' }}></div>
            </div>
            <div className="problem-grid fade-up" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><Database size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>End-to-End Digital Workflow</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>From proposal to possession</p>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--bhoomi-soft-bg)' }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><Map size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>GIS-Based Impact Analysis</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>Visualize. Analyze. Decide.</p>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--bhoomi-soft-bg)' }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><Users size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>Compensation & R&R Tracking</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>People at the core</p>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--bhoomi-soft-bg)' }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><Activity size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>Real-Time Monitoring</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>National to village level</p>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--bhoomi-soft-bg)' }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><Network size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>Interoperability</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>Connect existing systems</p>
                </div>
                <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--bhoomi-soft-bg)' }}>
                    <div style={{ color: 'var(--bhoomi-light-teal)', marginBottom: '0.75rem' }}><BarChart3 size={28} style={{ margin: '0 auto' }} /></div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bhoomi-navy)' }}>Decision Intelligence</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--bhoomi-sec-text)', marginTop: '0.25rem' }}>Insights for better outcomes</p>
                </div>
            </div>
        </section>
    );
}