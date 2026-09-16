import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NationalDashboard from './dashboards/NationalDashboard';
import StateDashboard from './dashboards/StateDashboard';
import DistrictDashboard from './dashboards/DistrictDashboard';
import AcquisitionOfficerDashboard from './dashboards/AcquisitionOfficerDashboard';
import FinanceDashboard from './dashboards/FinanceDashboard';
import RROfficerDashboard from './dashboards/RROfficerDashboard';
import FieldOfficerDashboard from './dashboards/FieldOfficerDashboard';
import AuditorDashboard from './dashboards/AuditorDashboard';
import CitizenPortal from './dashboards/CitizenPortal';

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
            return <AcquisitionOfficerDashboard />;
        case 'FINANCE_OFFICER':
            return <FinanceDashboard />;
        case 'RR_OFFICER':
            return <RROfficerDashboard />;
        case 'FIELD_OFFICER':
            return <FieldOfficerDashboard />;
        case 'AUDITOR':
            return <AuditorDashboard />;
        case 'CITIZEN':
            return <CitizenPortal />;
        default:
            return <div>Unauthorized Role View</div>;
    }
}
