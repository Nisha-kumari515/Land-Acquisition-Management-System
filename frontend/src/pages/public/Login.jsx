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
        <div className="login-page">
            <div className="login-container panel slide-in">
                <div className="login-header">
                    <div className="brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Map className="brand-icon" />
                        <span className="brand-text">BHOOMISETU</span>
                    </div>
                    <h2>Sign in to your account</h2>
                    <p style={{ color: 'var(--surface-500)', fontSize: '0.875rem' }}>National Land Acquisition Command Center</p>
                </div>

                {error && <div className="error-banner">{error}</div>}
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-200)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--surface-500)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Quick Demo Login</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {DEMO_USERS.map(demo => (
                            <button 
                                key={demo.label} 
                                type="button"
                                className="quiet-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                onClick={() => loadDemoUser(demo)}
                            >
                                <User size={14} /> {demo.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            className="form-input"
                        />
                    </div>
                    
                    <button type="submit" className="primary-btn w-full" disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#" className="quiet-link">Forgot password?</a>
                </div>
            </div>
        </div>
    );
}
