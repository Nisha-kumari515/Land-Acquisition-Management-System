import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Layers, Target } from 'lucide-react';

export default function Hero() {
    return (
        <section className="hero-container">
            <div className="hero-inner" >
                <div className="hero-content-wrapper fade-up visible">
                    <div className="hero-eyebrow">
                        <Map size={16} /> NATIONAL LAND ACQUISITION & MANAGEMENT PLATFORM
                    </div>
                    
                    <h1 className="hero-title">
                        ONE PARCEL.<br/>
                        ONE DIGITAL STORY.<br/>
                        <span className="teal-text">ONE NATIONAL<br/>ACQUISITION VIEW.</span>
                    </h1>
                    
                    <p className="hero-subtitle">
                        BHOOMISETU connects land records, cadastral GIS, acquisition workflows, compensation, rehabilitation & resettlement, and decision intelligence into one unified parcel-centric platform.
                    </p>
                    
                    <div className="hero-ctas">
                        <Link to="/login" className="btn-primary">Explore BHOOMISETU &rarr;</Link>
                        <a href="#gis" className="btn-secondary">View GIS Experience</a>
                    </div>
                    
                    <div className="hero-trust-line">
                        Parcel-centric • GIS-enabled • End-to-end acquisition monitoring
                    </div>
                </div>

                <div className="hero-gis-wrapper fade-up visible" style={{ animationDelay: '0.1s' }}>
                    <div className="gis-image-layer"></div>
                    
                    <div className="gis-floating-card card-project">
                        <div className="gis-card-label">PROJECT CORRIDOR</div>
                        <div className="gis-card-title">Proposed Infrastructure</div>
                        <div className="gis-card-info">Project Geometry</div>
                    </div>

                    <div className="gis-floating-card card-parcel">
                        <div className="gis-card-label">SELECTED PARCEL</div>
                        <div className="gis-card-title">Parcel Intelligence</div>
                        <div className="gis-card-info">Land Record • GIS Impact</div>
                    </div>

                    <div className="gis-floating-card card-impact">
                        <div className="gis-card-label">AFFECTED PARCELS</div>
                        <div className="gis-card-title">Project Impact</div>
                        <div className="gis-card-info">Spatial Analysis</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
