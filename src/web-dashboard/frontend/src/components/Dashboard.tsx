import React from 'react';
import MainLayout from './MainLayout';
import AnalyticsDashboard from './AnalyticsDashboard';

const Dashboard: React.FC = () => {

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
