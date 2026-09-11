import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Map, User } from 'lucide-react';

const DEMO_USERS = [
    { label: 'National Admin', email: 'admin@bhoomisetu.demo', password: 'demo-admin-password' },
    { label: 'State Officer', email: 'state.assam@bhoomisetu.demo', password: 'demo-state-password' },
    { label: 'District Officer', email: 'kamrup.officer@bhoomisetu.demo', password: 'demo-officer-password' },
    { label: 'Acquisition Officer', email: 'acquisition@bhoomisetu.demo', password: 'demo-acquisition-password' },
    { label: 'Finance Officer', email: 'finance@bhoomisetu.demo', password: 'demo-finance-password' },
    { label: 'R&R Officer', email: 'rr@bhoomisetu.demo', password: 'demo-rr-password' },
    { label: 'Field Officer', email: 'field.assam@bhoomisetu.demo', password: 'demo-field-password' }
];

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(DEMO_USERS[0].email);
    const [password, setPassword] = useState(DEMO_USERS[0].password);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (user) {
        return <Navigate to="/app/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/app/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to authenticate');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDemoUser = (demoUser) => {
        setEmail(demoUser.email);
        setPassword(demoUser.password);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '2rem 2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} className="slide-in">
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5b21b6', marginBottom: '1rem' }}>
                        <Map size={24} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em' }}>BHOOMISETU</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', textAlign: 'center' }}>Sign in to your account</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>National Land Acquisition Command Center</p>
                </div>

                {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Quick Demo Login</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {DEMO_USERS.map(demo => (
                            <button 
                                key={demo.label} 
                                type="button"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#475569', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease', width: '100%' }}
                                onClick={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    setTimeout(() => e.currentTarget.style.backgroundColor = 'white', 200);
                                    loadDemoUser(demo);
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <User size={16} color="#94a3b8" /> {demo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Email address</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '0.625rem 0.75rem', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', letterSpacing: '0.1em' }}
                            onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    
                    <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#5b21b6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'background-color 0.2s ease' }}
                    onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4c1d95')}
                    onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#5b21b6')}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <a href="#" style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#374151'} onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}>Forgot password?</a>
                </div>
            </div>
        </div>
    );
}
