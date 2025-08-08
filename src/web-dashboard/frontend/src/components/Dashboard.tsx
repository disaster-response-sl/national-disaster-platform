import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';
import MetricsCards from './MetricsCards';
import ActivityFeed from './ActivityFeed';
import GeographicOverview from './GeographicOverview';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log('Dashboard rendering - user:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  National Disaster Management
                </h1>
                <p className="text-sm text-gray-500">
                  Sri Lanka Emergency Response Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} • Online
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Metrics Cards */}
          <MetricsCards 
            metrics={{
              activeDisasters: 3,
              pendingSosSignals: 7,
              totalCitizensAffected: 1234,
              responseTeamsDeployed: 12,
              systemHealth: 'healthy',
              dataSyncStatus: 'synced',
              alertDistributionRate: 85
            }} 
            isLoading={false} 
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed 
                activities={[
                  {
                    id: '1',
                    type: 'sos',
                    title: 'SOS Signal Received',
                    description: 'Emergency assistance requested',
                    location: { lat: 6.9271, lng: 79.8612, address: 'Colombo District' },
                    priority: 'high',
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
                  },
                  {
                    id: '2',
                    type: 'report',
                    title: 'Citizen Report',
                    description: 'Flooding reported in residential area',
                    location: { lat: 7.2906, lng: 80.6337, address: 'Kandy District' },
                    priority: 'medium',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                  },
                  {
                    id: '3',
                    type: 'system_alert',
                    title: 'Disaster Alert',
                    description: 'Landslide warning issued for hill country',
                    location: { lat: 6.9497, lng: 80.7891, address: 'Nuwara Eliya' },
                    priority: 'high',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
                  }
                ]} 
                isLoading={false} 
              />
            </div>
            
            {/* Right Column - Geographic Overview */}
            <div className="lg:col-span-2">
              <GeographicOverview 
                disasters={[
                  {
                    _id: '1',
                    type: 'flood',
                    severity: 'high',
                    status: 'active',
                    description: 'Heavy flooding in urban areas due to monsoon rains',
                    location: { lat: 6.9271, lng: 79.8612 },
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    affected_population: 5000
                  },
                  {
                    _id: '2',
                    type: 'landslide',
                    severity: 'medium',
                    status: 'monitoring',
                    description: 'Potential landslide risk in hilly areas',
                    location: { lat: 6.9497, lng: 80.7891 },
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    affected_population: 800
                  },
                  {
                    _id: '3',
                    type: 'fire',
                    severity: 'critical',
                    status: 'active',
                    description: 'Wildfire spreading rapidly in forest area',
                    location: { lat: 7.2906, lng: 80.6337 },
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    affected_population: 1200
                  }
                ]} 
                isLoading={false} 
              />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions onRefresh={() => console.log('Refresh requested')} />


        </div>
      </main>
    </div>
  );
};

export default Dashboard;
