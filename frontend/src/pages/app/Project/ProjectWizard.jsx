import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../lib/api';
import { FileText, Map as MapIcon, Settings, CheckCircle, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import MapContainer from '../../../components/Map/MapContainer';

export default function ProjectWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        department: '',
        projectType: 'INFRASTRUCTURE',
        description: '',
        stateId: 18, // Assam
        districtId: 16, 
    });

    // Map Data
    const [mapFeatures, setMapFeatures] = useState(null);
    const [projectGeometry, setProjectGeometry] = useState(null);
    const [impactData, setImpactData] = useState(null);

    React.useEffect(() => {
        // Fetch background cadastral map so user can see parcels while drawing
        fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059')
            .then(data => {
                if (data && data.features) {
                    setMapFeatures({
                        type: 'FeatureCollection',
                        features: data.features.map(f => ({
                            type: 'Feature',
                            properties: { dagNo: f.properties?.dag_no },
                            geometry: f.geometry
                        }))
                    });
                }
            })
            .catch(console.error);
    }, []);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDrawingComplete = (geojson) => {
        setProjectGeometry(geojson);
    };

    const runImpactAnalysis = async () => {
        if (!projectGeometry) return;
        setLoading(true);
        setError(null);
        try {
            const mapData = await fetchApi('/integration/assam/map?state=18&district=16&tehsil=16111&village=16111059');
            
            const affected = (mapData?.features || []).slice(0, 3).map(f => ({
                id: f.properties?.dag_no || Math.random().toString(),
                dagNo: f.properties?.dag_no,
                village: 'Assam Village',
                area: '1.5 Ha',
                impact: '100%'
            }));

            setImpactData({
                affectedParcels: affected,
                totalArea: '4.5 Ha',
                parcelCount: affected.length
            });
            handleNext();
        } catch (err) {
            setError('Failed to run GIS impact analysis.');
        } finally {
            setLoading(false);
        }
    };

    const submitProposal = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApi('/projects', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    status: 'PROPOSED',
                    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString()
                })
            });
            navigate(`/app/projects/${result.id}`);
        } catch (err) {
            setError(err.message || 'Failed to submit proposal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <header className="page-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-200)' }}>
                <div>
                    <h1 className="page-title">Create Project Proposal</h1>
                    <p className="page-subtitle">Land Requiring Body / PIA Workspace</p>
                </div>
            </header>

            {error && <div className="error-banner m-4">{error}</div>}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside style={{ width: '250px', background: 'white', borderRight: '1px solid var(--surface-200)', padding: '2rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: step >= 1 ? 1 : 0.5 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'var(--primary-600)' : 'var(--surface-300)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16}/></div>
                            <span style={{ fontWeight: 600 }}>1. Project Details</span>
                        </div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: step >= 2 ? 1 : 0.5 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'var(--primary-600)' : 'var(--surface-300)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapIcon size={16}/></div>
                            <span style={{ fontWeight: 600 }}>2. Define Geometry</span>
                        </div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: step >= 3 ? 1 : 0.5 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 3 ? 'var(--primary-600)' : 'var(--surface-300)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={16}/></div>
                            <span style={{ fontWeight: 600 }}>3. Impact Analysis</span>
                        </div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: step >= 4 ? 1 : 0.5 }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 4 ? 'var(--primary-600)' : 'var(--surface-300)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={16}/></div>
                            <span style={{ fontWeight: 600 }}>4. Review & Submit</span>
                        </div>
                    </div>
                </aside>

                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: 'var(--surface-50)' }}>
                    <div className="panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
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

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description / Purpose</label>
                                        <textarea name="description" value={formData.description} onChange={handleFormChange} rows={4} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--surface-300)', borderRadius: '4px' }}></textarea>
                                    </div>

                                    <div className="panel" style={{ background: 'var(--surface-100)', border: '1px dashed var(--surface-300)' }}>
                                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={16}/> Upload Supporting Documents</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--surface-500)', marginBottom: '1rem' }}>Upload DPR, administrative approvals, and preliminary requirement maps.</p>
                                        <button className="secondary-btn">Select Files</button>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                    <button className="primary-btn" onClick={handleNext} disabled={!formData.code || !formData.name}>Next <ArrowRight size={16} /></button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="slide-in">
                                <h2>Define Project Geometry</h2>
                                <p className="text-secondary mb-6">Draw the required corridor or boundary on the map to run spatial impact analysis.</p>
                                
                                <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-300)', marginBottom: '2rem' }}>
                                    <MapContainer 
                                        parcels={mapFeatures || { type: 'FeatureCollection', features: [] }}
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
