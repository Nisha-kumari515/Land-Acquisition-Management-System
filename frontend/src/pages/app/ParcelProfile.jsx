import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import MapContainer from '../../components/Map/MapContainer';
import { 
    MapPin, FileText, AlertTriangle, ShieldCheck, 
    Database, User, Activity, Clock, FileStack, 
    Banknote, Users, CheckCircle, Navigation, ArrowLeft
} from 'lucide-react';

export default function ParcelProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [parcelData, setParcelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [mapParcels, setMapParcels] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchApi(`/parcels/${id}/intelligence`);
            setParcelData(data);
            
            if (data.geometry) {
                try {
                    const geojsonGeom = typeof data.geometry === 'string' ? JSON.parse(data.geometry) : data.geometry;
                    setMapParcels({
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: { id: data.parcel.id, ulpin: data.parcel.ulpin },
                            geometry: geojsonGeom
                        }]
                    });
                } catch (e) {
                    console.error('Failed to parse geometry', e);
                }
            } else {
                setMapParcels(null);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load parcel intelligence');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading" style={{ padding: '2rem' }}>Loading Universal Parcel Intelligence...</div>;
    
    if (error) return (
        <div style={{ padding: '2rem' }}>
            <button className="secondary-btn mb-4" onClick={() => navigate('/app/parcels')}><ArrowLeft size={16}/> Back to Parcels</button>
            <div className="error-banner">{error}</div>
        </div>
    );

    if (!parcelData) return null;

    const { parcel, ownership, projects, fieldVerification, documents, dataFreshness } = parcelData;

    return (
        <div className="parcel-profile" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--surface-50)' }}>
            <header className="page-header" style={{ borderBottom: '1px solid var(--surface-200)', padding: '1.5rem 2rem', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button className="quiet-btn" onClick={() => navigate('/app/parcels')}><ArrowLeft size={20}/></button>
                    <div>
                        <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--surface-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Database size={14} /> Universal Parcel Intelligence
                        </p>
                        <h1 className="page-title" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>ULPIN: {parcel.ulpin || 'Pending'}</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--surface-600)', fontSize: '0.875rem' }}>
                        <MapPin size={16} /> {parcel.village}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--surface-600)', fontSize: '0.875rem' }}>
                        <Clock size={16} /> Source Freshness: {dataFreshness?.lastSyncedAt ? new Date(dataFreshness.lastSyncedAt).toLocaleString() : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--surface-600)', fontSize: '0.875rem' }}>
                        <Database size={16} /> Source System: {parcel.sourceSystem || 'MANUAL'}
                    </div>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 600 }}>
                            <ShieldCheck size={16} /> Active Role: {user.role?.replace('_', ' ')}
                        </div>
                    )}
                </div>
            </header>

            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                
                {/* LEFT COLUMN: Main Info & Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Identity & Land Record */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <FileText size={20} style={{ color: 'var(--primary-600)' }} /> Identity & Land Record
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area</label>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{parcel.area} Hectares</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Village</label>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{parcel.village}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source System</label>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{parcel.sourceSystem || 'Unknown'}</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '0.75rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Ownership Details</h3>
                        {ownership && ownership.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {ownership.map((owner, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-50)', borderRadius: '6px', border: '1px solid var(--surface-100)' }}>
                                        <User size={16} style={{ color: 'var(--surface-500)' }} />
                                        <span style={{ fontWeight: 500, flex: 1 }}>{owner.name}</span>
                                        <span style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontWeight: 500, background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-200)' }}>Share: {owner.share || '100'}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No ownership records found.</p>
                        )}
                    </section>

                    {/* GIS DAG Layer */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                            <Navigation size={20} style={{ color: 'var(--primary-600)' }} /> GIS DAG Layer
                        </h2>
                        <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-200)', background: '#e5e5e5' }}>
                            <MapContainer 
                                parcels={mapParcels}
                                onParcelSelect={(p) => {
                                    if (p && p.id && p.id !== id) {
                                        navigate(`/app/parcel-profile/${p.id}`);
                                    }
                                }}
                            />
                        </div>
                    </section>

                    {/* Field Verification & Audit */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle size={20} style={{ color: 'var(--primary-600)' }} /> Field Verification & Audit
                        </h2>
                        {fieldVerification ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Status</label>
                                    <div style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', background: 'var(--surface-100)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>{fieldVerification.status}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Verification Date</label>
                                    <div style={{ fontWeight: 600 }}>{new Date(fieldVerification.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Notes</label>
                                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>{fieldVerification.notes || 'No notes provided.'}</p>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No field verification on record.</p>
                        )}
                    </section>

                </div>

                {/* RIGHT COLUMN: Projects, Acquisition, Risk, Documents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Projects & Acquisition context */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <Activity size={20} style={{ color: 'var(--primary-600)' }} /> Acquisition & Projects
                        </h2>
                        {projects && projects.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {projects.map((proj, idx) => (
                                    <div key={idx} style={{ padding: '1rem', border: '1px solid var(--surface-200)', borderRadius: '6px', background: 'var(--surface-50)' }}>
                                        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600 }}>{proj.project?.name || 'Unnamed Project'}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                            <div>
                                                <span style={{ color: 'var(--surface-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Stage</span>
                                                <strong style={{ background: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--surface-200)' }}>{proj.acquisitionStage?.replace('_', ' ')}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--surface-500)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Compensation</span>
                                                <strong style={{ background: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--surface-200)' }}>{proj.compensationStatus?.replace('_', ' ')}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>Not currently tagged to any active projects.</p>
                        )}
                    </section>

                    {/* Compensation & R&R */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <Banknote size={20} style={{ color: 'var(--primary-600)' }} /> Compensation & R&R
                        </h2>
                        {projects && projects.some(p => p.compensation || (p.rr && p.rr.length > 0)) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {projects.map((proj, idx) => {
                                    if (!proj.compensation && (!proj.rr || proj.rr.length === 0)) return null;
                                    return (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <h4 style={{ margin: '0', fontSize: '0.75rem', color: 'var(--surface-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project: {proj.project?.name}</h4>
                                            {proj.compensation && (
                                                <div style={{ padding: '0.75rem', background: '#F0FDF4', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                                                    <div style={{ fontWeight: 600, color: '#166534', fontSize: '1rem', marginBottom: '0.25rem' }}>Total Assessed: ₹{proj.compensation.totalAmount}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 500 }}>Status: {proj.compensation.status}</div>
                                                </div>
                                            )}
                                            {proj.rr && proj.rr.length > 0 && (
                                                <div style={{ padding: '0.75rem', background: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1E40AF', fontSize: '0.875rem' }}>
                                                        <Users size={16} /> R&R Families: {proj.rr.length}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No compensation or R&R records initiated.</p>
                        )}
                    </section>

                    {/* Risk Intelligence */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <AlertTriangle size={20} style={{ color: 'var(--primary-600)' }} /> Risk Intelligence
                        </h2>
                        {projects && projects.some(p => p.risks && p.risks.length > 0) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {projects.flatMap(p => p.risks).map((risk, idx) => (
                                    <div key={idx} style={{ padding: '0.75rem 1rem', borderLeft: `4px solid ${risk.score > 70 ? '#EF4444' : '#F59E0B'}`, background: 'var(--surface-50)', borderRadius: '0 6px 6px 0', borderTop: '1px solid var(--surface-100)', borderRight: '1px solid var(--surface-100)', borderBottom: '1px solid var(--surface-100)' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--surface-900)' }}>{risk.type?.replace('_', ' ')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--surface-500)', marginTop: '0.25rem' }}>Risk Score: {risk.score}/100</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No active risks detected.</p>
                        )}
                    </section>

                    {/* Documents */}
                    <section className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-200)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-100)', paddingBottom: '0.75rem', fontWeight: 600 }}>
                            <FileStack size={20} style={{ color: 'var(--primary-600)' }} /> Documents
                        </h2>
                        {documents && documents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {documents.map((doc, idx) => (
                                    <a key={idx} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', color: 'var(--primary-700)', background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}>
                                        <FileText size={18} style={{ color: '#64748B' }} />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{doc.documentType}</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No documents uploaded.</p>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
}
