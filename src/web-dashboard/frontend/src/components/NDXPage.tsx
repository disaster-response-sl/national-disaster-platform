import React from 'react';
import MainLayout from './MainLayout';
import NDXDashboard from './NDXDashboard';

const NDXPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <NDXDashboard />
        </div>
      </div>
    </MainLayout>
  );
};

export default NDXPage;
