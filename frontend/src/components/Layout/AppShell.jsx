import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Folder, Map, FileText, Bell, LogOut, User, Activity, AlertTriangle, IndianRupee } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

export default function AppShell() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) return <div className="loading-screen">Loading BHOOMISETU...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const ALL_NAV_ITEMS = [
        { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FINANCE_OFFICER', 'RR_OFFICER', 'FIELD_OFFICER', 'AUDITOR'] },
        { path: '/app/projects', label: 'Projects', icon: Folder, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'AUDITOR'] },
        { path: '/app/parcels', label: 'Parcels', icon: Map, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER', 'AUDITOR'] },
        { path: '/app/gis', label: 'GIS Map', icon: Map, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FIELD_OFFICER', 'AUDITOR'] },
        { path: '/app/acquisition', label: 'Acquisition', icon: Activity, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'] },
        { path: '/app/compensation', label: 'Compensation', icon: IndianRupee, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FINANCE_OFFICER'] },
        { path: '/app/risks', label: 'Risk Engine', icon: AlertTriangle, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER'] },
        { path: '/app/reports', label: 'Reports', icon: FileText, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FINANCE_OFFICER', 'RR_OFFICER', 'AUDITOR'] },
        { path: '/app/documents', label: 'Documents', icon: FileText, roles: ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'AUDITOR'] },
        { path: '/app/audit', label: 'Audit / Activity', icon: Activity, roles: ['NATIONAL_ADMIN', 'AUDITOR'] },
    ];

    const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(user.role));

    return (
        <div className="app-layout">
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="brand">
                        <Map className="brand-icon" />
                        <span className="brand-text">BHOOMISETU</span>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-group">
                        <span className="nav-label">MAIN MENU</span>
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar"><User size={16}/></div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <div className="app-content-wrapper">
                <header className="app-topbar">
                    <div className="breadcrumb">
                        <span>Application</span>
                        <span className="separator">/</span>
                        <span className="current">{location.pathname.split('/').pop().toUpperCase()}</span>
                    </div>
                    
                    <div style={{ flex: 1, padding: '0 2rem', display: 'flex', justifyContent: 'center' }}>
                        <GlobalSearch />
                    </div>

                    <div className="topbar-actions">
                        <div className="sync-state">
                            <span className="sync-dot"></span> Live monitoring
                        </div>
                        <button className="icon-btn"><Bell size={20}/></button>
                    </div>
                </header>
                
                <main className="app-main fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
