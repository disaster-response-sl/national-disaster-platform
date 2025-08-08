import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';

const SimpleDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  National Disaster Management Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time monitoring for Sri Lanka
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-sm font-medium text-gray-900">
                  Welcome, {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  Role: {user?.role?.toUpperCase()}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Test Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Test</h2>
            <p className="text-gray-600">
              This is a simplified dashboard to test if the basic structure works.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-sm text-red-800">Active Disasters</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">7</p>
                <p className="text-sm text-orange-800">Pending SOS</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">1,234</p>
                <p className="text-sm text-blue-800">Citizens Affected</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm text-green-800">Response Teams</p>
              </div>
            </div>
          </div>

          {/* Test Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">SOS Signal Received</p>
                    <p className="text-xs text-gray-500">Colombo - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Citizen Report</p>
                    <p className="text-xs text-gray-500">Kandy - 5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Sync</span>
                  <span className="text-sm font-medium text-yellow-600">Syncing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;
