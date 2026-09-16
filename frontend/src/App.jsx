import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import AppShell from './components/Layout/AppShell';
import DashboardRouter from './pages/app/Dashboard';
import GIS from './pages/app/GIS';
import Projects from './pages/app/Projects';
import ProjectWizard from './pages/app/Project/ProjectWizard';
import Parcels from './pages/app/Parcels';
import ParcelProfile from './pages/app/ParcelProfile';
import NationalGISMapStudio from './pages/app/NationalGISMapStudio';
import Acquisition from './pages/app/Acquisition';
import Compensation from './pages/app/Compensation';
import Risks from './pages/app/Risks';
import Reports from './pages/app/Reports';

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
                        <Route path="projects" element={<Projects />} />
                        <Route path="projects/new" element={<ProjectWizard />} />
                        <Route path="parcels" element={<Parcels />} />
                        <Route path="parcel-profile/:id" element={<ParcelProfile />} />
                        <Route path="gis" element={<GIS />} />
                        <Route path="gis-studio" element={<NationalGISMapStudio />} />
                        <Route path="acquisition" element={<Acquisition />} />
                        <Route path="compensation" element={<Compensation />} />
                        <Route path="risks" element={<Risks />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="documents" element={<div>Documents Module Coming Soon</div>} />
                        <Route path="audit" element={<DashboardRouter />} />
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
