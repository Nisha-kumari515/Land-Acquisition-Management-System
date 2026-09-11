import React from 'react';

export default function GenericRoleDashboard({ roleName, dependency }) {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">{roleName}</p>
                    <h1 className="page-title">Operations Center</h1>
                </div>
            </header>
            <div className="panel mt-6">
                <div className="empty-state">
                    <h3>Role Interface Initialized</h3>
                    <p>The UI shell for {roleName} is active.</p>
                    {dependency && <p className="mt-6" style={{color: 'var(--alert-600)'}}>Backend Dependency: {dependency}</p>}
                </div>
            </div>
        </div>
    );
}
