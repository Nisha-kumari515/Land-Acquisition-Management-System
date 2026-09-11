import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import AppShell from './components/Layout/AppShell';
import DashboardRouter from './pages/app/Dashboard';
import GenericPage from './pages/app/GenericPage';
import GIS from './pages/app/GIS';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/app" element={<AppShell />}>
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardRouter />} />
                        <Route path="projects" element={<GenericPage title="Projects" />} />
                        <Route path="parcels" element={<GenericPage title="Parcels" />} />
                        <Route path="gis" element={<GIS />} />
                        <Route path="acquisition" element={<GenericPage title="Acquisition" />} />
                        <Route path="compensation" element={<GenericPage title="Compensation" />} />
                        <Route path="risks" element={<GenericPage title="Risk Engine" />} />
                        <Route path="reports" element={<GenericPage title="Reports" />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
