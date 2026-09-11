import "../../Landing.css";
import React, { useEffect } from 'react';
import Navbar from './landing/components/Navbar';
import Hero from './landing/components/Hero';
import FeatureStrip from './landing/components/FeatureStrip';
import ProblemSection from './landing/components/ProblemSection';
import SolutionSection from './landing/components/SolutionSection';
import WorkflowSection from './landing/components/WorkflowSection';
import GISShowcase from './landing/components/GISShowcase';
import ParcelIntelligence from './landing/components/ParcelIntelligence';
import Stakeholders from './landing/components/Stakeholders';
import DecisionIntelligence from './landing/components/DecisionIntelligence';
import Interoperability from './landing/components/Interoperability';
import NationalScale from './landing/components/NationalScale';
import Governance from './landing/components/Governance';
import FinalCTA from './landing/components/FinalCTA';
import Footer from './landing/components/Footer';

export default function Landing() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: stop observing once it has faded in
                    // observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        const elements = document.querySelectorAll('.fade-up');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page-root">
            <Navbar />
            <Hero />
            <FeatureStrip />
            <ProblemSection />
            <SolutionSection />
            <WorkflowSection />
            <GISShowcase />
            <ParcelIntelligence />
            <Stakeholders />
            <DecisionIntelligence />
            <Interoperability />
            <NationalScale />
            <Governance />
            <FinalCTA />
            <Footer />
        </div>
    );
}
