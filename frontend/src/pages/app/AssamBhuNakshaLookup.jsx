import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Database, Save } from 'lucide-react';

export default function AssamBhuNakshaLookup({ onImported }) {
    const [districts, setDistricts] = useState([]);
    const [circles, setCircles] = useState([]);
    const [villages, setVillages] = useState([]);
    const [dags, setDags] = useState([]);

    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCircle, setSelectedCircle] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');

    const [loading, setLoading] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDistricts();
    }, []);

    const loadDistricts = async () => {
        setLoading('districts');
        try {
            const data = await fetchApi('/integrations/assam/districts');
            setDistricts(Array.isArray(data) ? data : (data?.data || data?.districts || data?.payload || Object.values(data).find(Array.isArray) || []));
        } catch (err) {
            setError('Failed to load districts: ' + err.message);
        }
        setLoading('');
    };

    const handleDistrictChange = async (e) => {
        const dCode = e.target.value;
        setSelectedDistrict(dCode);
        setSelectedCircle('');
        setSelectedVillage('');
        setCircles([]);
        setVillages([]);
        setDags([]);
        if (!dCode) return;
        
        setLoading('circles');
        try {
            const data = await fetchApi('/integrations/assam/circles', {
                method: 'POST',
                body: JSON.stringify({ district_code: dCode })
            });
            setCircles(Array.isArray(data) ? data : (data?.data || data?.circles || data?.payload || Object.values(data).find(Array.isArray) || []));
        } catch (err) {
            setError('Failed to load circles: ' + err.message);
        }
        setLoading('');
    };

    const handleCircleChange = async (e) => {
        const cCode = e.target.value;
        setSelectedCircle(cCode);
        setSelectedVillage('');
        setVillages([]);
        setDags([]);
        if (!cCode) return;

        setLoading('villages');
        try {
            const data = await fetchApi('/integrations/assam/villages', {
                method: 'POST',
                body: JSON.stringify({ circle_code: cCode })
            });
            setVillages(Array.isArray(data) ? data : (data?.data || data?.villages || data?.payload || Object.values(data).find(Array.isArray) || []));
        } catch (err) {
            setError('Failed to load villages: ' + err.message);
        }
        setLoading('');
    };

    const handleVillageChange = async (e) => {
        const vCode = e.target.value;
        setSelectedVillage(vCode);
        setDags([]);
        if (!vCode) return;

        setLoading('dags');
        try {
            const data = await fetchApi('/integrations/assam/dags', {
                method: 'POST',
                body: JSON.stringify({ location: vCode }) // Assuming location is village code
            });
            setDags(Array.isArray(data) ? data : (data?.data || data?.dags || data?.payload || Object.values(data).find(Array.isArray) || []));
        } catch (err) {
            setError('Failed to load dags: ' + err.message);
        }
        setLoading('');
    };

    const handleImportDag = async (dag) => {
        try {
            setLoading('importing');
            // Using existing backend adapter route /api/integrations/assam/sync
            await fetchApi('/integrations/assam/sync', {
                method: 'POST',
                body: JSON.stringify({
                    locationCode: selectedVillage,
                    dagNo: dag.dag_no || dag.dagNo
                })
            });
            if (onImported) onImported();
            alert('Dag imported successfully');
        } catch (err) {
            setError('Import failed: ' + err.message);
        } finally {
            setLoading('');
        }
    };

    return (
        <div className="panel" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="var(--primary-600)" />
                Assam Dharitree & BhuNaksha Registry
            </h3>

            {error && <div className="error-banner mb-4">{error}</div>}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--surface-500)' }}>District</label>
                    <select 
                        value={selectedDistrict} 
                        onChange={handleDistrictChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }}
                        disabled={loading === 'districts'}
                    >
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.value || d.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--surface-500)' }}>Circle</label>
                    <select 
                        value={selectedCircle} 
                        onChange={handleCircleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }}
                        disabled={!selectedDistrict || loading === 'circles'}
                    >
                        <option value="">Select Circle</option>
                        {circles.map(c => (
                            <option key={c.code} value={c.code}>{c.value || c.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--surface-500)' }}>Village</label>
                    <select 
                        value={selectedVillage} 
                        onChange={handleVillageChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--surface-300)' }}
                        disabled={!selectedCircle || loading === 'villages'}
                    >
                        <option value="">Select Village</option>
                        {villages.map(v => (
                            <option key={v.code} value={v.code}>{v.value || v.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading === 'dags' && <div className="loading">Fetching Dags from Dharitree...</div>}

            {dags.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--surface-700)' }}>Found {dags.length} Dags in selected village</h4>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--surface-200)', textAlign: 'left', color: 'var(--surface-500)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '0.75rem 0.5rem' }}>Dag No</th>
                                    <th style={{ padding: '0.75rem 0.5rem' }}>Patta Number</th>
                                    <th style={{ padding: '0.75rem 0.5rem' }}>Patta Type</th>
                                    <th style={{ padding: '0.75rem 0.5rem' }}>Land Class</th>
                                    <th style={{ padding: '0.75rem 0.5rem' }}>Area (B-K-L)</th>
                                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dags.map((dag, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--surface-200)' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{dag.dag_no}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{dag.patta_number}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{dag.patta_type}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>{dag.land_class}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            {dag.dag_area_bigha}-{dag.dag_area_katha}-{dag.dag_area_lessa}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                            <button 
                                                className="secondary-btn" 
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                onClick={() => handleImportDag(dag)}
                                                disabled={loading === 'importing'}
                                            >
                                                <Save size={14} /> Import
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
