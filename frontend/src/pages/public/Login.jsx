import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Map, User, ChevronRight, Check } from 'lucide-react';
import Navbar from './landing/components/Navbar';
import Footer from './landing/components/Footer';

const DEMO_USERS = [
    { label: 'National Admin', email: 'admin@bhoomisetu.demo', password: 'demo-admin-password', color: '#163A70' },
    { label: 'State Officer', email: 'state.assam@bhoomisetu.demo', password: 'demo-state-password', color: '#009B9A' },
    { label: 'District Officer', email: 'kamrup.officer@bhoomisetu.demo', password: 'demo-officer-password', color: '#D98B00' },
    { label: 'Acquisition Officer', email: 'acquisition@bhoomisetu.demo', password: 'demo-acquisition-password', color: '#D64545' },
    { label: 'Finance Officer', email: 'finance@bhoomisetu.demo', password: 'demo-finance-password', color: '#159A72' },
    { label: 'R&R Officer', email: 'rr@bhoomisetu.demo', password: 'demo-rr-password', color: '#163A70' },
    { label: 'Field Officer', email: 'field.assam@bhoomisetu.demo', password: 'demo-field-password', color: '#009B9A' }
];

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(DEMO_USERS[0].email);
    const [password, setPassword] = useState(DEMO_USERS[0].password);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(DEMO_USERS[0].label);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        setSelectedRole(demoUser.label);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F4F8FB' }}>
            <Navbar />
            
            <main style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '120px 2rem 4rem 2rem', // Top padding to clear fixed navbar
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 155, 154, 0.08) 0%, transparent 70%)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(22, 58, 112, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>

                <div className="auth-card slide-in" style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '900px',
                    display: 'flex',
                    boxShadow: '0 20px 40px rgba(20, 33, 61, 0.08)',
                    border: '1px solid rgba(217, 227, 238, 0.5)',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'hidden'
                }}>
                    {/* Left Side - Login Form */}
                    <div style={{ flex: '1 1 50%', padding: '3.5rem 3rem' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#163A70', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
                            <p style={{ color: '#526581', fontSize: '0.95rem' }}>Sign in to the BHOOMISETU National Dashboard.</p>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#FFF1F0', color: '#D64545', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', border: '1px solid #FFCCC7' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#14213D', marginBottom: '0.5rem' }}>Email Address</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    style={{ 
                                        width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', 
                                        border: '1px solid #D9E3EE', borderRadius: '10px', outline: 'none',
                                        transition: 'all 0.2s ease', backgroundColor: '#F9FBFC'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#009B9A'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(0, 155, 154, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#D9E3EE'; e.target.style.backgroundColor = '#F9FBFC'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#14213D', marginBottom: '0.5rem' }}>Password</label>
                                <input 
                                    id="password" 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    style={{ 
                                        width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', 
                                        border: '1px solid #D9E3EE', borderRadius: '10px', outline: 'none', letterSpacing: '0.1em',
                                        transition: 'all 0.2s ease', backgroundColor: '#F9FBFC'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#009B9A'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(0, 155, 154, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#D9E3EE'; e.target.style.backgroundColor = '#F9FBFC'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            
                            <button type="submit" disabled={isLoading} style={{ 
                                width: '100%', padding: '0.875rem', backgroundColor: '#163A70', color: 'white', 
                                border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, 
                                cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', 
                                transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(22, 58, 112, 0.2)'
                            }}
                            onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(22, 58, 112, 0.3)')}
                            onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 58, 112, 0.2)')}
                            >
                                {isLoading ? 'Authenticating...' : 'Sign In'} <ChevronRight size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Right Side - Quick Demo Roles */}
                    <div style={{ flex: '1 1 50%', backgroundColor: '#F8FAFC', padding: '3.5rem 3rem', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#14213D', marginBottom: '0.25rem' }}>Demo Access</h3>
                            <p style={{ color: '#526581', fontSize: '0.85rem' }}>Select a role to autofill credentials instantly.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {DEMO_USERS.map(demo => {
                                const isSelected = selectedRole === demo.label;
                                return (
                                    <button 
                                        key={demo.label} 
                                        type="button"
                                        style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.875rem 1.25rem', fontSize: '0.9rem', fontWeight: 600,
                                            color: isSelected ? demo.color : '#526581', 
                                            backgroundColor: isSelected ? 'white' : 'transparent', 
                                            border: `1px solid ${isSelected ? demo.color : '#CBD5E1'}`, 
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                                            boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                        onClick={() => loadDemoUser(demo)}
                                        onMouseOver={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)';
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <User size={18} color={isSelected ? demo.color : '#94A3B8'} /> 
                                            {demo.label}
                                        </div>
                                        {isSelected && <Check size={18} color={demo.color} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                {/* Embedded CSS for responsive auth card */}
                <style>{`
                    @media (max-width: 860px) {
                        .auth-card { flex-direction: column !important; }
                        .auth-card > div { flex: none !important; padding: 2rem !important; }
                    }
                `}</style>
            </main>

            <Footer />
        </div>
    );
}
