import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NationalDashboard from './dashboards/NationalDashboard';
import StateDashboard from './dashboards/StateDashboard';
import DistrictDashboard from './dashboards/DistrictDashboard';
import GenericRoleDashboard from './dashboards/GenericRoleDashboard';

export default function DashboardRouter() {
    const { user } = useAuth();

    switch (user?.role) {
        case 'NATIONAL_ADMIN':
            return <NationalDashboard />;
        case 'STATE_OFFICER':
            return <StateDashboard />;
        case 'DISTRICT_OFFICER':
            return <DistrictDashboard />;
        case 'ACQUISITION_OFFICER':
            return <GenericRoleDashboard roleName="Acquisition Officer" dependency="GET /api/dashboard/acquisition" />;
        case 'FINANCE_OFFICER':
            return <GenericRoleDashboard roleName="Finance Officer" dependency="GET /api/dashboard/finance" />;
        case 'RR_OFFICER':
            return <GenericRoleDashboard roleName="R&R Officer" dependency="GET /api/dashboard/rr" />;
        case 'FIELD_OFFICER':
            return <GenericRoleDashboard roleName="Field Officer" dependency="GET /api/dashboard/field" />;
        default:
            return <div>Unauthorized Role View</div>;
    }
}
