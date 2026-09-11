import React from 'react';
import { Layers, Map, Target, Eye } from 'lucide-react';

export default function GISShowcase() {
    return (
        <section id="gis" className="section bg-blue-soft">
            <div className="section-wrapper fade-up">
                <span className="section-label">Spatial Intelligence</span>
                <h2 className="section-title">See the land before you make the decision.</h2>
                <p className="section-desc">BhoomiSetu National GIS Map Studio overlays infrastructure alignments directly onto cadastral boundaries to instantly identify affected parcels and spatial risks.</p>
                
                <div className="product-panel fade-up" style={{ animationDelay: '0.2s', marginTop: '3rem' }}>
                    <div className="product-panel-sidebar">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-navy)' }}>Live Cadastral Mapping</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            Interact directly with geo-referenced land records. No more guessing impact boundaries.
                        </p>
                        <ul className="feature-list">
                            <li><Map size={18} color="var(--primary-navy)" /> High-resolution DAG boundaries</li>
                            <li><Target size={18} color="var(--primary-navy)" /> Infrastructure project geometry</li>
                            <li><Layers size={18} color="var(--primary-navy)" /> Auto-calculation of affected area</li>
                            <li><Eye size={18} color="var(--primary-navy)" /> Drone & satellite base layers</li>
                        </ul>
                    </div>
                    <div className="product-panel-main">
                        <div className="gis-image-layer" style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/images/bhoomisetu_hero_gis.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div className="hero-map-controls" style={{ position: 'absolute', right: '1rem', bottom: '1rem', zIndex: 10 }}>
                            <div className="map-control-btn">+</div>
                            <div className="map-control-btn">−</div>
                            <div className="map-control-btn"><Layers size={16} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
