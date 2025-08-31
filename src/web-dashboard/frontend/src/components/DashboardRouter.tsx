import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import ResponderDashboard from './ResponderDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  // Show ResponderDashboard for responders, regular Dashboard for admins
  if (user?.role === 'responder') {
    return <ResponderDashboard />;
  }

  // Default to admin dashboard
  return <Dashboard />;
};

export default DashboardRouter;
