import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/client';
import { projectApi } from '../../../api/projects';
import { mapApi } from '../../../api/map';
import { FileText, Map as MapIcon, Settings, CheckCircle, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import MapContainer from '../../../components/Map/MapContainer';

export default function ProjectWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form Data
    const [projectId, setProjectId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        department: '',
        projectType: 'HIGHWAY',
        description: '',
        stateId: 'cmtwxf9p80007dwhow6h9dwq5', // Assam Default
        districtId: 'cmtwxf9pe000adwho2zpivvk1', // Kamrup M Default
        circleId: '16111',
        villageId: '16111059',
        roadWidth: '30' // For highways
    });

    // Geography Dropdowns (Assam specific for Demo)
    const districts = [
        { id: 'cmtwxf9pe000adwho2zpivvk1', name: 'Kamrup Metropolitan' },
        { id: '15', name: 'Kamrup Rural' },
        { id: '2', name: 'Barpeta' }
    ];
    
    const circles = {
        'cmtwxf9pe000adwho2zpivvk1': [{ id: '16111', name: 'Guwahati' }, { id: '16112', name: 'Dispur' }],
        '15': [{ id: '15001', name: 'Rangia' }],
        '2': [{ id: '2001', name: 'Barpeta' }]
    };

    const villages = {
        '16111': [{ id: '16111059', name: 'Nongpoh / Beltola Area' }, { id: '16111060', name: 'Azara' }],
        '16112': [{ id: '16112001', name: 'Hatigaon' }],
        '15001': [{ id: '15001001', name: 'Kamalpur' }],
        '2001': [{ id: '2001001', name: 'Pathsala' }]
    };

    // Map Data
    const [mapFeatures, setMapFeatures] = useState({ type: 'FeatureCollection', features: [] });
    const [existingProjects, setExistingProjects] = useState({ type: 'FeatureCollection', features: [] });
    const [projectGeometry, setProjectGeometry] = useState(null);
    const [impactData, setImpactData] = useState(null);

    useEffect(() => {
        // Fetch background cadastral map + existing projects for the selected village
        mapApi.getParcels({ village: formData.villageId })
            .then(data => {
                if (data) setMapFeatures(data);
            })
            .catch(console.error);

        mapApi.getProjects()
            .then(data => {
                if (data) setExistingProjects(data);
            })
            .catch(console.error);
    }, [formData.villageId]);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDrawingComplete = (geometry) => {
        setProjectGeometry(geometry);
    };

    const runImpactAnalysis = async () => {
        if (!projectGeometry) return;
        setLoading(true);
        setError(null);
        try {
            let pid = projectId;
            if (!pid) {
                const result = await projectApi.create({
                    ...formData,
                    type: formData.projectType,
                    status: 'PROPOSED'
                });
                pid = result.id;
                setProjectId(pid);
            }

            // Let the backend calculate intersection on actual parcel data
            const impact = await projectApi.analyzeImpact(pid, projectGeometry);
            
            const affected = (impact.parcels || []).map(p => ({
                id: p.parcel_id,
                dagNo: p.dagNo || 'N/A',
                village: p.village || 'N/A',
                area: p.affected_area ? `${Number(p.affected_area).toFixed(2)} sq.m` : 'N/A',
                impact: p.affected_percentage ? `${p.affected_percentage}%` : 'N/A'
            }));

            setImpactData({
                affectedParcels: affected,
                totalArea: impact.totalAffectedArea ? `${Number(impact.totalAffectedArea).toFixed(2)} sq.m` : '0 sq.m',
                parcelCount: impact.affectedParcels || affected.length
            });
            handleNext();
        } catch (err) {
            console.error(err);
            setError('Failed to run GIS impact analysis. ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const submitProposal = async () => {
        setLoading(true);
        setError(null);
        try {
            if (projectId) {
                await projectApi.submit(projectId);
                navigate(`/app/projects/${projectId}`);
            } else {
                const result = await projectApi.create({
                    ...formData,
                    type: formData.projectType,
                    status: 'PROPOSED'
                });
                navigate(`/app/projects/${result.id}`);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit proposal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Project Proposal</h1>
            <p className="text-secondary" style={{ marginBottom: '2rem' }}>Land Requiring Body / PIA Workspace</p>

            {error && <div className="error-banner mb-6">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                <aside>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: step >= 1 ? 'var(--primary-600)' : 'var(--surface-400)', fontWeight: step >= 1 ? 600 : 400 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 1 ? 'var(--primary-100)' : 'var(--surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                {step > 1 ? <CheckCircle size={14} /> : '1'}
                            </div>
                            Project Details
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: step >= 2 ? 'var(--primary-600)' : 'var(--surface-400)', fontWeight: step >= 2 ? 600 : 400 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 2 ? 'var(--primary-100)' : 'var(--surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                {step > 2 ? <CheckCircle size={14} /> : '2'}
                            </div>
                            Define Geometry
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: step >= 3 ? 'var(--primary-600)' : 'var(--surface-400)', fontWeight: step >= 3 ? 600 : 400 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 3 ? 'var(--primary-100)' : 'var(--surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                {step > 3 ? <CheckCircle size={14} /> : '3'}
                            </div>
                            Impact Analysis
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: step >= 4 ? 'var(--primary-600)' : 'var(--surface-400)', fontWeight: step >= 4 ? 600 : 400 }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step >= 4 ? 'var(--primary-100)' : 'var(--surface-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                {step > 4 ? <CheckCircle size={14} /> : '4'}
                            </div>
                            Review & Submit
                        </div>
                    </div>
                </aside>
                
                <main className="panel">
                    <div style={{ minHeight: '400px' }}>
                        {step === 1 && (
                            <div className="slide-in">
                                <h2>Project Information</h2>
                                <p className="text-secondary mb-6">Enter the official details for the land acquisition proposal.</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project Code</label>
                                            <input type="text" name="code" value={formData.code} onChange={handleFormChange} placeholder="e.g. NH-2026-01" className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }} />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter official project name" className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Implementing Agency / Dept</label>
                                            <input type="text" name="department" value={formData.department} onChange={handleFormChange} placeholder="e.g. NHAI, PWD" className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project Type</label>
                                            <select name="projectType" value={formData.projectType} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}>
                                                <option value="INFRASTRUCTURE">Infrastructure</option>
                                                <option value="HIGHWAY">Highway</option>
                                                <option value="RAILWAY">Railway</option>
                                                <option value="IRRIGATION">Irrigation</option>
                                                <option value="DEFENCE">Defence</option>
                                                <option value="ENERGY">Energy</option>
                                            </select>
                                        </div>
                                    </div>

                                    {formData.projectType === 'HIGHWAY' && (
                                        <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-200)' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Road Classification</label>
                                                <select name="roadType" className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}>
                                                    <option>National Highway (NH)</option>
                                                    <option>State Highway (SH)</option>
                                                    <option>Major District Road (MDR)</option>
                                                    <option>Other District Road (ODR)</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Corridor Right of Way Width (meters)</label>
                                                <input type="number" name="roadWidth" value={formData.roadWidth} onChange={handleFormChange} className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-200)' }}>Geography Selection</h3>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State</label>
                                                <select name="stateId" value={formData.stateId} disabled style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px', background: 'var(--surface-100)' }}>
                                                    <option value="18">Assam</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>District</label>
                                                <select name="districtId" value={formData.districtId} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}>
                                                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Revenue Circle</label>
                                                <select name="circleId" value={formData.circleId} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}>
                                                    {(circles[formData.districtId] || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Village</label>
                                                <select name="villageId" value={formData.villageId} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}>
                                                    {(villages[formData.circleId] || []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Purpose / Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Provide justification for land acquisition..." rows={4} className="input-field" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px', resize: 'vertical' }} />
                                    </div>

                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button className="primary-btn" onClick={handleNext}>Next: Define Geometry</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="slide-in">
                                <h2>Define Project Geometry</h2>
                                <p className="text-secondary mb-6">Draw the required corridor or boundary on the map to run spatial impact analysis. Existing infrastructure, highways, and houses are visible on the base map layer.</p>
                                
                                <div style={{ height: '450px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-300)', marginBottom: '2rem' }}>
                                    <MapContainer 
                                        parcels={mapFeatures}
                                        projects={existingProjects}
                                        isDrawing={true}
                                        onDrawingComplete={handleDrawingComplete}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="secondary-btn" onClick={handlePrev}>Back</button>
                                    <button className="primary-btn" onClick={runImpactAnalysis} disabled={!projectGeometry || loading}>
                                        {loading ? 'Analyzing Impact...' : 'Run GIS Impact Analysis'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="slide-in">
                                <h2>GIS Impact Analysis Results</h2>
                                <p className="text-secondary mb-6">Review the parcels that intersect with your proposed project boundary.</p>
                                
                                {impactData && (
                                    <>
                                        <div className="stats-grid mb-6">
                                            <div className="panel metric-card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
                                                <p>Affected Parcels</p>
                                                <h3>{impactData.parcelCount}</h3>
                                            </div>
                                            <div className="panel metric-card" style={{ background: 'var(--primary-50)', borderColor: 'var(--primary-200)' }}>
                                                <p>Total Required Area</p>
                                                <h3>{impactData.totalArea}</h3>
                                            </div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                                    <th style={{ padding: '1rem 0.5rem' }}>DAG NO</th>
                                                    <th style={{ padding: '1rem 0.5rem' }}>VILLAGE</th>
                                                    <th style={{ padding: '1rem 0.5rem' }}>AREA</th>
                                                    <th style={{ padding: '1rem 0.5rem' }}>IMPACT %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {impactData.affectedParcels.map((p, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{p.dagNo || 'N/A'}</td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>{p.village}</td>
                                                        <td style={{ padding: '1rem 0.5rem' }}>{p.area}</td>
                                                        <td style={{ padding: '1rem 0.5rem', color: 'var(--alert-600)' }}>{p.impact}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="secondary-btn" onClick={handlePrev}>Back</button>
                                    <button className="primary-btn" onClick={handleNext}>Confirm & Proceed</button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="slide-in">
                                <h2>Review & Submit Proposal</h2>
                                <p className="text-secondary mb-6">Please review all details before submitting for official scrutiny.</p>
                                
                                <div className="panel mb-6" style={{ background: 'var(--surface-50)' }}>
                                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-200)', paddingBottom: '0.5rem' }}>Project Synopsis</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Code</span>
                                            <p style={{ fontWeight: 500 }}>{formData.code}</p>
                                        </div>
                                        <div>
                                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Name</span>
                                            <p style={{ fontWeight: 500 }}>{formData.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Department</span>
                                            <p style={{ fontWeight: 500 }}>{formData.department}</p>
                                        </div>
                                        <div>
                                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Type</span>
                                            <p style={{ fontWeight: 500 }}>{formData.projectType}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel mb-6" style={{ background: 'var(--warning-50)', borderColor: 'var(--warning-200)' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                        <AlertCircle size={20} color="var(--warning-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ color: 'var(--warning-800)', marginBottom: '0.25rem' }}>Declaration</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--warning-700)', margin: 0 }}>
                                                By submitting this proposal, you certify that the land requirement is minimal and essential for the public purpose. The proposal will be sent to the State Nodal Officer for scrutiny.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="secondary-btn" onClick={handlePrev} disabled={loading}>Back</button>
                                    <button className="primary-btn" onClick={submitProposal} disabled={loading}>
                                        {loading ? 'Submitting...' : 'Submit Final Proposal'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
